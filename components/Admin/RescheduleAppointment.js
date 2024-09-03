import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { updateDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const RescheduleAppointment = ({ appointment, onClose, onUpdate }) => {
  const [date, setDate] = useState(new Date(appointment.date));
  const [time, setTime] = useState(appointment.time);
  const [teamMember, setTeamMember] = useState(appointment.teamMemberData[0]?.id || '');
  const [service, setService] = useState(appointment.serviceId || '');
  const [teamMembers, setTeamMembers] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamMembersQuery = query(
          collection(db, 'users'),
          where('businessId', '==', appointment.businessId),
          where('role', '==', 'team')
        );
        const teamMembersSnapshot = await getDocs(teamMembersQuery);

        const teamMembersData = teamMembersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().displayName
        }));

        setTeamMembers(teamMembersData);

        const servicesQuery = query(collection(db, 'services'), where('businessId', '==', appointment.businessId));
        const servicesSnapshot = await getDocs(servicesQuery);

        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, [appointment.businessId]);

  const handleUpdateAppointment = async () => {
    try {
      const appointmentRef = doc(db, 'appointments', appointment.id);

      const newTeamMemberData = [{
        displayName: teamMembers.find(m => m.id === teamMember)?.name || '',
        id: teamMember,
      }];

      await updateDoc(appointmentRef, {
        date: date.toISOString().split('T')[0],
        time,
        teamMemberData: newTeamMemberData,
        serviceId: service
      });

      alert('Appointment rescheduled successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating appointment:', error.message);
      alert('Failed to reschedule appointment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reschedule Appointment</h2>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 font-bold mb-2">Date</label>
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="time" className="block text-gray-700 font-bold mb-2">Time</label>
          <input
            id="time"
            type="time"
            className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
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
      </div>
    </div>
  );
};

export default RescheduleAppointment;
