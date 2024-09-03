import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { format as formatDateFn } from 'date-fns'; // Import date-fns for better date formatting

const ViewAppointments = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Fetch businesses on component mount
    const fetchBusinesses = async () => {
      try {
        const businessesSnapshot = await getDocs(collection(db, 'businesses'));
        const businessesData = businessesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setBusinesses(businessesData);
      } catch (error) {
        console.error('Error fetching businesses:', error.message);
      }
    };

    fetchBusinesses();
  }, []);

  const fetchAppointments = async (businessId, customerEmail) => {
    try {
      const q = query(
        collection(db, 'appointments'),
        where('businessId', '==', businessId),
        where('customerEmail', '==', customerEmail),
        where('status', '==', 'booked')
      );
      const querySnapshot = await getDocs(q);
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        customerEmail: doc.data().customerEmail,
        customerName: doc.data().customerName,
        customerPhone: doc.data().customerPhone,
        teamMemberData: doc.data().teamMemberData || [], // Ensure this field is an array
        date: doc.data().date,
        time: doc.data().time,
        status: doc.data().status,
        description: doc.data().description,
        duration: doc.data().duration,
        ...doc.data()
      }));

      if (appointmentsData.length === 0) {
        setErrorMessage('No appointments found for the given business and customer email.');
      } else {
        setErrorMessage('');
      }
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
      setErrorMessage('Failed to fetch appointments. Please check the selected business and customer email, and try again.');
    }
  };

  const handleFetchAppointments = () => {
    if (selectedBusinessId.trim() === '' || customerEmail.trim() === '') {
      setErrorMessage('Please select a business and enter a valid customer email.');
      return;
    }
    fetchAppointments(selectedBusinessId, customerEmail);
  };

  // Helper function to format date
  const formatDate = (date) => {
    return formatDateFn(new Date(date), 'dd/MM/yyyy');
  };

  // Helper function to format time as hh:mm AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const formattedHours = parseInt(hours) % 12 || 12;
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${formattedHours}:${minutes} ${period}`;
  };

  // Helper function to format Team Member Names
  const formatTeamMemberNames = (teamMembers) => {
    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      return <span className="text-red-600">No Team Members available</span>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {teamMembers.map((member, index) => (
          <span key={index} className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm">
            {member.displayName}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Appointments</h2>

        <div className="mb-6">
          <label htmlFor="business-select" className="block text-gray-700 text-sm font-semibold mb-2">
            Select Business:
          </label>
          <select
            id="business-select"
            className="block w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-3 px-4 mb-4 focus:outline-none focus:bg-white focus:border-gray-500"
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
          >
            <option value="">Select a business</option>
            {businesses.map(business => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="customer-email-input" className="block text-gray-700 text-sm font-semibold mb-2">
            Enter Customer Email:
          </label>
          <input
            type="email"
            id="customer-email-input"
            className="block w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-3 px-4 mb-4 focus:outline-none focus:bg-white focus:border-gray-500"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter customer email"
          />
        </div>

        <button
          type="button"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          onClick={handleFetchAppointments}
        >
          Load Appointments
        </button>

        {errorMessage && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
            {errorMessage}
          </div>
        )}

        <div className="mt-8">
          <ul className="space-y-6">
            {appointments.map(appointment => (
              <li key={appointment.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-semibold text-gray-800">Appointment ID:</h3>
                    <p className="text-gray-600">{appointment.id}</p>
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-semibold text-gray-800">Team Members:</h3>
                    {formatTeamMemberNames(appointment.teamMemberData)}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Date:</h3>
                  <p className="text-gray-600">{formatDate(appointment.date)}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Time:</h3>
                  <p className="text-gray-600">{formatTime(appointment.time)}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Status:</h3>
                  <p className={`text-gray-600 font-semibold ${appointment.status === 'booked' ? 'text-green-600' : ''}`}>
                    {appointment.status}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Customer Name:</h3>
                  <p className="text-gray-600">{appointment.customerName}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Customer Email:</h3>
                  <p className="text-gray-600">{appointment.customerEmail}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Customer Phone:</h3>
                  <p className="text-gray-600">{appointment.customerPhone}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Service Name:</h3>
                  <p className="text-gray-600">{appointment.name}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Service Description:</h3>
                  <p className="text-gray-600">{appointment.description}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">Service Duration:</h3>
                  <p className="text-gray-600">{appointment.duration}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ViewAppointments;
