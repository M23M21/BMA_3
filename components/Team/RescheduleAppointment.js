import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { updateDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';

const RescheduleAppointment = ({ appointment, onClose, onUpdate }) => {
  const [teamMember, setTeamMember] = useState(appointment.teamMemberData[0]?.id || '');
  const [service, setService] = useState(appointment.serviceId || '');
  const [teamMembers, setTeamMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = collection(db, 'users');
        const teamMembersQuery = query(
          usersRef,
          where('businessId', '==', appointment.businessId),
          where('role', '==', 'team')
        );
        const teamMembersSnapshot = await getDocs(teamMembersQuery);

        const teamMembersData = teamMembersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().displayName
        }));

        setTeamMembers(teamMembersData);

        const servicesRef = collection(db, 'services');
        const servicesQuery = query(servicesRef, where('businessId', '==', appointment.businessId));
        const servicesSnapshot = await getDocs(servicesQuery);

        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setServices(servicesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, [appointment.businessId]);

  const handleUpdateAppointment = async () => {
    try {
      const newTeamMemberData = [{
        displayName: teamMembers.find(m => m.id === teamMember)?.name || '',
        id: teamMember,
      }];
  
      const updatedAppointment = {
        ...appointment,
        teamMemberData: newTeamMemberData,
        serviceId: service,
      };
  
      const appointmentRef = doc(db, 'appointments', appointment.id);
      await updateDoc(appointmentRef, updatedAppointment);
  
      alert('Appointment rescheduled successfully!');
      onUpdate(updatedAppointment);  // Pass the updated appointment object
      onClose();
    } catch (error) {
      console.error('Error updating appointment:', error.message);
      alert('Failed to update appointment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reschedule Appointment</h2>
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="teamMember" className="block text-gray-700 font-bold mb-2">Team Member</label>
              <select
                id="teamMember"
                className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={teamMember}
                onChange={(e) => setTeamMember(e.target.value)}
              >
                <option value="">Select a team member</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="service" className="block text-gray-700 font-bold mb-2">Service</label>
              <select
                id="service"
                className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleUpdateAppointment}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RescheduleAppointment;
