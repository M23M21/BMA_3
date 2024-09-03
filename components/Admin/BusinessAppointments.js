import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { collection, getDocs, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore'; // Added getDoc import
import { getAuth } from 'firebase/auth';
import { format as formatDateFn } from 'date-fns';
import axios from 'axios';
import EditAppointment from './EditAppointment';
import RescheduleAppointment from './RescheduleAppointment';

const BusinessAppointments = () => {
  const [businessId, setBusinessId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBusinessId(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (businessId) {
      fetchAppointments(businessId);
    }
  }, [businessId]);

  const fetchBusinessId = async (userId) => {
    try {
      const businessesSnapshot = await getDocs(
        query(collection(db, 'businesses'), where('userId', '==', userId))
      );
      const businessesData = businessesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (businessesData.length > 0) {
        setBusinessId(businessesData[0].id); // Set the first business's ID
      } else {
        setErrorMessage('No businesses found for the user.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching business ID:', error.message);
      setErrorMessage('Failed to fetch business ID. Please try again.');
      setIsLoading(false);
    }
  };

  const fetchAppointments = async (businessId) => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'appointments'),
        where('businessId', '==', businessId),
        where('status', '==', 'booked')
      );
      const querySnapshot = await getDocs(q);
      const appointmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (appointmentsData.length === 0) {
        setErrorMessage('No appointments found for the selected business.');
      } else {
        setErrorMessage('');
      }
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
      setErrorMessage('Failed to fetch appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const appointmentToCancel = appointments.find(appointment => appointment.id === appointmentId);
      await deleteDoc(doc(db, 'appointments', appointmentId));
      alert('Appointment canceled successfully!');

      // Send email notification after cancellation
      await axios.post('/api/sendEmail', {
        customerEmail: appointmentToCancel.customerEmail,
        customerName: appointmentToCancel.customerName,
        appointment: appointmentToCancel,
        action: 'canceled',
      });

      fetchAppointments(businessId);
    } catch (error) {
      console.error('Error canceling appointment:', error.message);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduling(true);
  };

  const handleUpdate = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      let actor = 'A team member';
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          actor = userDoc.data().displayName || 'A team member';
        }
      }
  
      fetchAppointments(businessId);
      
      // Send an email if needed
      if (selectedAppointment) {
        await axios.post('/api/sendEmail', {
          customerEmail: selectedAppointment.customerEmail,
          customerName: selectedAppointment.customerName,
          appointment: selectedAppointment,
          action: 'updated', 
          actor: actor, // Pass the actor's name
          actorRole: 'team'
        });
      }
      
      setSelectedAppointment(null);
      setIsRescheduling(false);
    } catch (error) {
      console.error('Error updating appointment:', error.message);
      alert('Failed to update appointment. Please try again.');
    }
  };

  const handleCloseEdit = () => {
    setSelectedAppointment(null);
    setIsRescheduling(false);
  };

  const formatDate = (date) => formatDateFn(new Date(date), 'dd/MM/yyyy');
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const formattedHours = parseInt(hours) % 12 || 12;
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${formattedHours}:${minutes} ${period}`;
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">View Appointments</h2>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
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
                        <div className="flex flex-wrap gap-2">
                          {appointment.teamMemberData && appointment.teamMemberData.length > 0 ? (
                            appointment.teamMemberData.map((teamMember, index) => (
                              <span key={index} className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm">
                                {teamMember.displayName}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-600">No team members assigned.</p>
                          )}
                        </div>
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

                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRescheduleAppointment(appointment)}
                        className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        {selectedAppointment && !isRescheduling && (
          <EditAppointment
            appointment={selectedAppointment}
            onClose={handleCloseEdit}
            onUpdate={handleUpdate}
          />
        )}
        {selectedAppointment && isRescheduling && (
          <RescheduleAppointment
            appointment={selectedAppointment}
            onClose={handleCloseEdit}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default BusinessAppointments;
