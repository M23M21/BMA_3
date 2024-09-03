/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const BusinessAvailabilityManager = ({ selectedBusiness }) => {
  const [businessAvailability, setBusinessAvailability] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedBusinessAvailability, setSelectedBusinessAvailability] = useState('');
  const [workingHours, setWorkingHours] = useState({
    start: '09:00',
    end: '18:00',
  });
  const [breaks, setBreaks] = useState([]);
  const [newBreak, setNewBreak] = useState({ start: '', end: '' });

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    if (selectedBusiness) {
      const businessRef = doc(db, 'businesses', selectedBusiness.id);
      const unsubscribe = onSnapshot(businessRef, (docSnapshot) => {
        const data = docSnapshot.data();
        if (data?.BusinessAvailability) {
          const availability = daysOfWeek.map(day => ({
            id: day,
            day,
            BusinessAvailability: data.BusinessAvailability[day]?.status || 'Not available',
            hours: data.BusinessAvailability[day]?.hours || { start: '09:00', end: '18:00' },
            breaks: data.BusinessAvailability[day]?.breaks || [],
          }));
          setBusinessAvailability(availability);
          if (selectedDay) {
            setBreaks(data.BusinessAvailability[selectedDay]?.breaks || []);
          }
        } else {
          setBusinessAvailability([]);
        }
      });

      return () => unsubscribe();
    }
  }, [selectedBusiness, selectedDay]);

  const handleSetBusinessAvailability = async () => {
    if (!selectedBusiness || !selectedDay || !selectedBusinessAvailability) {
      alert('Please select a day and set business availability.');
      return;
    }

    try {
      const businessRef = doc(db, 'businesses', selectedBusiness.id);
      await updateDoc(businessRef, {
        [`BusinessAvailability.${selectedDay}`]: {
          status: selectedBusinessAvailability,
          hours: selectedBusinessAvailability === 'Available' ? workingHours : { start: '09:00', end: '18:00' },
          breaks: selectedBusinessAvailability === 'Available' ? breaks : [],
        },
      });

      alert('Business availability, working hours, and breaks set successfully!');
      setSelectedDay('');
      setSelectedBusinessAvailability('');
      setWorkingHours({ start: '09:00', end: '18:00' });
      setBreaks([]);
    } catch (error) {
      console.error('Error setting business availability:', error.message);
      alert('Failed to set business availability. Please try again.');
    }
  };

  const handleToggleBusinessAvailability = async (availabilityId, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'Not available' : 'Available';
    try {
      const businessRef = doc(db, 'businesses', selectedBusiness.id);
      await updateDoc(businessRef, {
        [`BusinessAvailability.${availabilityId}`]: {
          status: newStatus,
          hours: newStatus === 'Available' ? workingHours : { start: '09:00', end: '18:00' },
          breaks: newStatus === 'Available' ? breaks : [],
        },
      });

      alert(`Business availability updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating business availability:', error.message);
      alert('Failed to update business availability. Please try again.');
    }
  };

  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target;
    setWorkingHours((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewBreakChange = (e) => {
    const { name, value } = e.target;
    setNewBreak((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addBreak = () => {
    if (newBreak.start && newBreak.end) {
      const start = new Date(`1970-01-01T${newBreak.start}:00`);
      const end = new Date(`1970-01-01T${newBreak.end}:00`);

      const hasOverlap = breaks.some(brk => {
        const brkStart = new Date(`1970-01-01T${brk.start}:00`);
        const brkEnd = new Date(`1970-01-01T${brk.end}:00`);
        return (start < brkEnd && end > brkStart);
      });

      if (hasOverlap) {
        alert('This break overlaps with an existing break. Please choose a different time.');
        return;
      }

      const updatedBreaks = [...breaks, newBreak];
      setBreaks(updatedBreaks);

      updateBreaksInFirestore(updatedBreaks);

      setNewBreak({ start: '', end: '' });
    } else {
      alert('Please enter both start and end times for the break.');
    }
  };

  const updateBreaksInFirestore = async (updatedBreaks) => {
    if (!selectedBusiness || !selectedDay) return;

    try {
      const businessRef = doc(db, 'businesses', selectedBusiness.id);
      await updateDoc(businessRef, {
        [`BusinessAvailability.${selectedDay}.breaks`]: updatedBreaks,
      });
    } catch (error) {
      console.error('Error updating breaks in Firestore:', error.message);
      alert('Failed to update breaks. Please try again.');
    }
  };

  const handleRemoveBreak = (breakIndex) => {
    const updatedBreaks = breaks.filter((_, index) => index !== breakIndex);
    setBreaks(updatedBreaks);

    updateBreaksInFirestore(updatedBreaks);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Business Availability</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Set Business Availability</h2>
        <div className="flex flex-wrap mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label htmlFor="day" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Select Day:</label>
            <select
              id="day"
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="">Select a day</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label htmlFor="BusinessAvailability" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Set Business Availability:</label>
            <select
              id="BusinessAvailability"
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={selectedBusinessAvailability}
              onChange={(e) => {
                const newValue = e.target.value;
                setSelectedBusinessAvailability(newValue);
                if (newValue === 'Not available') {
                  setWorkingHours({ start: '09:00', end: '18:00' });
                  setBreaks([]);
                }
              }}
            >
              <option value="">Select Business Availability</option>
              <option value="Available">Available</option>
              <option value="Not available">Not available</option>
            </select>
          </div>
        </div>
        {selectedBusinessAvailability === 'Available' && (
          <>
            <div className="mb-4">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Working Hours:</label>
              <div className="flex gap-4">
                <div className="w-full md:w-1/2">
                  <label htmlFor="start" className="block text-gray-700">Start Time:</label>
                  <input
                    id="start"
                    name="start"
                    type="time"
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={workingHours.start}
                    onChange={handleWorkingHoursChange}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="end" className="block text-gray-700">End Time:</label>
                  <input
                    id="end"
                    name="end"
                    type="time"
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={workingHours.end}
                    onChange={handleWorkingHoursChange}
                  />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Breaks:</label>
              <div className="flex gap-4 mb-4">
                <div className="w-full md:w-1/2">
                  <label htmlFor="breakStart" className="block text-gray-700">Break Start Time:</label>
                  <input
                    id="breakStart"
                    name="start"
                    type="time"
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={newBreak.start}
                    onChange={handleNewBreakChange}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="breakEnd" className="block text-gray-700">Break End Time:</label>
                  <input
                    id="breakEnd"
                    name="end"
                    type="time"
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={newBreak.end}
                    onChange={handleNewBreakChange}
                  />
                </div>
              </div>
              <button
                type="button"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                onClick={addBreak}
              >
                Add Break
              </button>
            </div>
          </>
        )}
        <button
          type="button"
          className={`w-full py-3 px-4 rounded focus:outline-none focus:shadow-outline ${selectedBusinessAvailability === 'Available' ? 'bg-blue-500 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-700'}`}
          onClick={handleSetBusinessAvailability}
        >
          Set Business Availability
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Overview Business Availability</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessAvailability.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg shadow-sm">
              <p className="font-semibold text-xl text-gray-900">{item.day}</p>
              <p className={`${item.BusinessAvailability === 'Available' ? 'text-green-500' : 'text-red-500'} font-bold text-lg`}>
                {item.BusinessAvailability}
              </p>
              {item.BusinessAvailability === 'Available' && (
                <>
                  <p className="mt-2 text-gray-700"><strong>Working Hours:</strong> {item.hours.start} - {item.hours.end}</p>
                  {item.breaks.length > 0 && (
                    <div className="mt-2">
                      <p className="text-gray-700"><strong>Breaks:</strong> {item.breaks.map((brk, index) => (
                        <span key={index} className="inline-flex items-center gap-2">
                          {`${brk.start} - ${brk.end}`}
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveBreak(index)}
                          >
                            Cancel
                          </button>
                        </span>
                      )).reduce((prev, curr) => [prev, ', ', curr])}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="mt-4">
                <button
                  className={`py-2 px-4 rounded focus:outline-none focus:shadow-outline ${item.BusinessAvailability === 'Available' ? 'bg-green-500 text-white hover:bg-green-700' : 'bg-red-500 text-white hover:bg-red-700'}`}
                  onClick={() => handleToggleBusinessAvailability(item.id, item.BusinessAvailability)}
                >
                  {item.BusinessAvailability === 'Available' ? 'Set Not Available' : 'Set Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessAvailabilityManager;
