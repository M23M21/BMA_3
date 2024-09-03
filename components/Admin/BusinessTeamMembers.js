import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const BusinessTeamMembers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [status, setStatus] = useState('Available');
  const [availability, setAvailability] = useState({});
  const [availableDays, setAvailableDays] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchAvailability(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const businessesQuery = query(collection(db, 'businesses'), where('uidTeamAvailability', '!=', {}));
      const businessesSnapshot = await getDocs(businessesQuery);

      if (!businessesSnapshot.empty) {
        const businessDoc = businessesSnapshot.docs[0];
        const businessData = businessDoc.data();
        const availabilityData = businessData.uidTeamAvailability;

        const userIds = Object.keys(availabilityData);
        const usersPromises = userIds.map(id => getDoc(doc(db, 'users', id)));
        const usersSnapshots = await Promise.all(usersPromises);

        const usersData = usersSnapshots.map(snapshot => ({
          id: snapshot.id,
          ...snapshot.data(),
        }));

        setUsers(usersData);
      } else {
        console.error('No business documents found!');
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };

  const fetchAvailability = (userId) => {
    const businessesQuery = query(collection(db, 'businesses'), where(`uidTeamAvailability.${userId}`, '!=', null));
    const unsubscribe = onSnapshot(businessesQuery, (snapshot) => {
      if (!snapshot.empty) {
        const businessDoc = snapshot.docs[0];
        const businessData = businessDoc.data();
        const teamAvailability = businessData.uidTeamAvailability[userId];
        if (teamAvailability) {
          setAvailability(teamAvailability);
          setAvailableDays(Object.keys(teamAvailability));
        } else {
          setAvailability({});
          setAvailableDays([]);
        }
      } else {
        console.error('No such business document!');
      }
    });

    return () => unsubscribe();
  };

  const handleSetAvailability = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedDay) {
      alert('Please select a user and a day.');
      return;
    }

    try {
      const businessesQuery = query(collection(db, 'businesses'), where(`uidTeamAvailability.${selectedUser.id}`, '!=', null));
      const businessesSnapshot = await getDocs(businessesQuery);
      if (!businessesSnapshot.empty) {
        const businessDoc = businessesSnapshot.docs[0];
        const businessRef = doc(db, 'businesses', businessDoc.id);
        await updateDoc(businessRef, {
          [`uidTeamAvailability.${selectedUser.id}.${selectedDay}`]: status,
        });

        alert('User availability set successfully!');
        setSelectedDay('');
      } else {
        console.error('No such business document!');
      }
    } catch (error) {
      console.error('Error setting user availability:', error.message);
      alert('Failed to set user availability. Please try again.');
    }
  };

  const handleChangeStatus = async (day) => {
    try {
      const businessesQuery = query(collection(db, 'businesses'), where(`uidTeamAvailability.${selectedUser.id}`, '!=', null));
      const businessesSnapshot = await getDocs(businessesQuery);
      if (!businessesSnapshot.empty) {
        const businessDoc = businessesSnapshot.docs[0];
        const businessRef = doc(db, 'businesses', businessDoc.id);
        const newStatus = availability[day] === 'Available' ? 'Not Available' : 'Available';
        await updateDoc(businessRef, {
          [`uidTeamAvailability.${selectedUser.id}.${day}`]: newStatus,
        });

        alert('Availability status updated successfully!');
      } else {
        console.error('No such business document!');
      }
    } catch (error) {
      console.error('Error updating availability status:', error.message);
      alert('Failed to update availability status. Please try again.');
    }
  };

  const handleDeleteAvailability = async (day) => {
    try {
      const businessesQuery = query(collection(db, 'businesses'), where(`uidTeamAvailability.${selectedUser.id}`, '!=', null));
      const businessesSnapshot = await getDocs(businessesQuery);
  
      if (!businessesSnapshot.empty) {
        const businessDoc = businessesSnapshot.docs[0];
        const businessRef = doc(db, 'businesses', businessDoc.id);
  
        // Update the document to remove the specific day's availability
        await updateDoc(businessRef, {
          [`uidTeamAvailability.${selectedUser.id}.${day}`]: null
        });
  
        alert('Availability deleted successfully!');
        fetchAvailability(selectedUser.id); // Refresh availability after deletion
      } else {
        console.error('No such business document!');
      }
    } catch (error) {
      console.error('Error deleting availability:', error.message);
      alert('Failed to delete availability. Please try again.');
    }
  };

  const daysOfWeekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="container mx-auto p-12 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Business (Team Members)</h1>

      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Set Team Members Availability</h2>
        <div className="flex flex-wrap mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label htmlFor="user-select" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Select User:</label>
            <select
              id="user-select"
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={selectedUser ? selectedUser.id : ''}
              onChange={(e) => {
                const selected = users.find(user => user.id === e.target.value);
                setSelectedUser(selected);
              }}
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.displayName}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label htmlFor="day-select" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Select Day:</label>
            <select
              id="day-select"
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="">Select a day</option>
              {daysOfWeekOrder.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          onClick={handleSetAvailability}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
        >
          Set Availability
        </button>
      </div>

      {selectedUser && (
        <div className="bg-white p-6 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Overview User Availability</h2>
          <div className="grid grid-cols-2 gap-4">
            {daysOfWeekOrder.map(day => (
              <div key={day} className="border p-4 rounded-lg">
                <p className="font-semibold">{day}</p>
                {availability[day] === 'Available' ? (
                  <p className="text-green-500">Available</p>
                ) : (
                  <p className="text-red-500">Not Available</p>
                )}
                <div className="mt-2">
                  <button
                    onClick={() => handleChangeStatus(day)}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline mr-2"
                  >
                    Change Status
                  </button>
                  <button
                    onClick={() => handleDeleteAvailability(day)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:shadow-outline"
                  >
                    Delete Availability
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessTeamMembers;
