/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

const BusinessServices = ({ businessId, onServicesUpdated }) => {
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceTeamMembers, setServiceTeamMembers] = useState([]);
  const [serviceDurationHours, setServiceDurationHours] = useState('');
  const [serviceDurationMinutes, setServiceDurationMinutes] = useState('');
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectAll, setSelectAll] = useState(false); // Track "select all" option

  useEffect(() => {
    if (businessId) {
      fetchServices();
      fetchTeamMembers();
    }
  }, [businessId]);

  const fetchServices = async () => {
    if (!businessId) {
      console.error('Business ID is not available.');
      return;
    }

    try {
      const servicesSnapshot = await getDocs(
        query(collection(db, 'services'), where('businessId', '==', businessId))
      );
      const servicesData = servicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error.message);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const businessesQuery = query(collection(db, 'businesses'), where('uidTeamAvailability', '!=', {}));
      const businessesSnapshot = await getDocs(businessesQuery);

      if (!businessesSnapshot.empty) {
        const businessDoc = businessesSnapshot.docs.find(doc => doc.id === businessId);
        if (businessDoc) {
          const businessData = businessDoc.data();
          const availabilityData = businessData.uidTeamAvailability;
          const userIds = Object.keys(availabilityData);

          const usersPromises = userIds.map(id => getDoc(doc(db, 'users', id)));
          const usersSnapshots = await Promise.all(usersPromises);

          const teamMembersData = usersSnapshots.map(snapshot => ({
            id: snapshot.id,
            ...snapshot.data(),
          }));

          setTeamMembers(teamMembersData);
        } else {
          console.error('Business document not found!');
        }
      } else {
        console.error('No business documents found!');
      }
    } catch (error) {
      console.error('Error fetching team members:', error.message);
    }
  };

  const handleCreateService = async () => {
    if (!serviceName || !serviceDescription || !serviceCategory || !serviceDurationHours || !serviceDurationMinutes) {
      alert('Please provide all required service details.');
      return;
    }

    if (!businessId) {
      alert('No business selected.');
      return;
    }

    try {
      const newService = {
        name: serviceName,
        description: serviceDescription,
        category: serviceCategory,
        teamMembers: selectAll ? teamMembers.map(member => member.id) : serviceTeamMembers,
        duration: {
          hours: serviceDurationHours,
          minutes: serviceDurationMinutes
        },
        businessId,
      };

      const docRef = doc(collection(db, 'services'));
      await setDoc(docRef, newService);

      alert('Service created successfully!');
      setServiceName('');
      setServiceDescription('');
      setServiceCategory('');
      setServiceTeamMembers([]);
      setServiceDurationHours('');
      setServiceDurationMinutes('');
      setSelectAll(false); // Reset selectAll
      fetchServices();
      if (onServicesUpdated) onServicesUpdated();
    } catch (error) {
      console.error('Error creating service:', error.message);
      alert('Failed to create service. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'services', serviceId));
      alert('Service deleted successfully!');
      fetchServices();
      if (onServicesUpdated) onServicesUpdated();
    } catch (error) {
      console.error('Error deleting service:', error.message);
      alert('Failed to delete service. Please try again.');
    }
  };

  const handleTeamMemberChange = (e) => {
    const selectedOptions = [...e.target.selectedOptions].map(option => option.value);
    if (e.target.value === 'all') {
      setSelectAll(true);
      setServiceTeamMembers([]);
    } else {
      setSelectAll(false);
      setServiceTeamMembers(selectedOptions);
    }
  };

  // Helper function to get team member names by IDs
  const getTeamMemberNames = (memberIds) => {
    return teamMembers
      .filter(member => memberIds.includes(member.id))
      .map(member => member.displayName)
      .join(', ');
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Business Services</h1>

      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create Services</h2>
        
        {/* Create Service Section */}
        <div className="mb-6">
          <label htmlFor="serviceName" className="block text-gray-700 font-bold mb-2">Service Name</label>
          <input
            id="serviceName"
            type="text"
            className="border border-gray-300 p-2 w-full rounded"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="serviceDescription" className="block text-gray-700 font-bold mb-2">Service Description</label>
          <textarea
            id="serviceDescription"
            className="border border-gray-300 p-2 w-full rounded"
            rows="4"
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="serviceCategory" className="block text-gray-700 font-bold mb-2">Service Category</label>
          <select
            id="serviceCategory"
            className="border border-gray-300 p-2 w-full rounded"
            value={serviceCategory}
            onChange={(e) => setServiceCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Beauty and Wellness">Beauty and Wellness</option>
            <option value="Sport">Sport</option>
            <option value="Personal Meetings and Services">Personal Meetings and Services</option>
            <option value="Medical">Medical</option>
            <option value="Events and Entertainment">Events and Entertainment</option>
            <option value="Education">Education</option>
            <option value="Retailers">Retailers</option>
            <option value="Other Category">Other Category</option>
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="serviceTeamMembers" className="block text-gray-700 font-bold mb-2">Service Team Members</label>
          <select
            id="serviceTeamMembers"
            className="border border-gray-300 p-2 w-full rounded"
            multiple
            value={selectAll ? ['all'] : serviceTeamMembers}
            onChange={handleTeamMemberChange}
          >
            <option value="all">Select All Team Members</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.displayName} ({member.role})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6 flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="serviceDurationHours" className="block text-gray-700 font-bold mb-2">Service Duration (Hours)</label>
            <input
              id="serviceDurationHours"
              type="number"
              className="border border-gray-300 p-2 w-full rounded"
              value={serviceDurationHours}
              onChange={(e) => setServiceDurationHours(e.target.value)}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="serviceDurationMinutes" className="block text-gray-700 font-bold mb-2">Service Duration (Minutes)</label>
            <input
              id="serviceDurationMinutes"
              type="number"
              className="border border-gray-300 p-2 w-full rounded"
              value={serviceDurationMinutes}
              onChange={(e) => setServiceDurationMinutes(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleCreateService}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Create Service
        </button>
        
        {/* List Services */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Existing Services</h3>
          {services.length > 0 ? (
            <ul>
              {services.map((service) => (
                <li key={service.id} className="mb-4 p-4 border border-gray-300 rounded">
                  <p><strong>Name:</strong> {service.name}</p>
                  <p><strong>Description:</strong> {service.description}</p>
                  <p><strong>Category:</strong> {service.category}</p>
                  <p><strong>Team Members:</strong> {service.teamMembers && Array.isArray(service.teamMembers) ? getTeamMemberNames(service.teamMembers) : 'None'}</p>
                  <p><strong>Duration:</strong> {service.duration?.hours || 0} hours {service.duration?.minutes || 0} minutes</p>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                  >
                    Delete Service
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No services available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessServices;
