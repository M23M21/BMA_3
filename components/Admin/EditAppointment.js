import React, { useState } from 'react';
import { db } from '../../utils/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditAppointment = ({ appointment, onClose, onUpdate }) => {
  const [date, setDate] = useState(new Date(appointment.date));
  const [time, setTime] = useState(appointment.time);

  const handleUpdateAppointment = async () => {
    try {
      const appointmentRef = doc(db, 'appointments', appointment.id);
      await updateDoc(appointmentRef, {
        date: date.toISOString().split('T')[0], // format date as yyyy-mm-dd
        time,
      });
      alert('Appointment updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating appointment:', error.message);
      alert('Failed to update appointment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Edit Appointment</h2>
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

export default EditAppointment;
