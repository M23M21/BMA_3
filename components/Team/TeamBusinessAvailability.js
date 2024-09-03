/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { getDocs, getDoc, collection, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const TeamBusinessAvailability = () => {
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [businessAvailability, setBusinessAvailability] = useState({});
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                setLoggedInUserId(user.uid);
                const userRef = doc(db, 'users', user.uid);
                const userSnapshot = await getDoc(userRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    if (userData.businessId) {
                        setSelectedBusiness({ id: userData.businessId }); // Automatically select the user's business
                    }
                }
            }
        };
        fetchUserData();
    }, [user]);

    useEffect(() => {
        fetchBusinesses();
    }, [selectedBusiness]);

    useEffect(() => {
        if (selectedBusiness) {
            const unsubscribe = onSnapshot(doc(db, 'businesses', selectedBusiness.id), (snapshot) => {
                if (snapshot.exists()) {
                    const { BusinessAvailability } = snapshot.data();
                    setBusinessAvailability(BusinessAvailability || {});
                } else {
                    console.error('Business not found');
                }
            });

            return () => unsubscribe();
        }
    }, [selectedBusiness]);

    const fetchBusinesses = async () => {
        try {
            const businessesSnapshot = await getDocs(collection(db, 'businesses'));
            const businessesData = businessesSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(business => business.id === selectedBusiness?.id); // Filter to show only the selected business
            setBusinesses(businessesData);
        } catch (error) {
            console.error('Error fetching businesses:', error.message);
        }
    };

    const daysOfWeekOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Overview Selected Business Availability</h2>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                        <label htmlFor="business-select" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                            Select Business:
                        </label>
                        <select
                            id="business-select"
                            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            value={selectedBusiness ? selectedBusiness.id : ''}
                            onChange={(e) => {
                                const selected = businesses.find(business => business.id === e.target.value);
                                setSelectedBusiness(selected);
                            }}
                        >
                            {businesses.map(business => (
                                <option key={business.id} value={business.id}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedBusiness && (
                    <div>
                        <ul className="space-y-4">
                            {daysOfWeekOrder.map(day => (
                                <li key={day} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                <strong>Day:</strong> {day}
                                            </p>
                                            <p className={`text-xs ${businessAvailability[day]?.status === 'Available' ? 'text-green-500' : 'text-red-500'}`}>
                                                {businessAvailability[day]?.status || 'Not set'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                               Business ID: {selectedBusiness.id}
                                            </p>
                                        </div>
                                        <div>
                                            <button
                                                className={`px-3 py-1 rounded text-white ${businessAvailability[day]?.status === 'Available' ? 'bg-green-500' : 'bg-red-500'} cursor-not-allowed opacity-50`}
                                                disabled
                                            >
                                                {businessAvailability[day]?.status === 'Available' ? 'Available' : 'Not Available'}
                                            </button>
                                        </div>
                                    </div>
                                    {businessAvailability[day]?.status === 'Available' && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-700"><strong>Working Hours:</strong> {businessAvailability[day]?.hours.start} - {businessAvailability[day]?.hours.end}</p>
                                            {businessAvailability[day]?.breaks.length > 0 && (
                                                <p className="text-xs text-gray-700">
                                                    <strong>Breaks:</strong> {businessAvailability[day]?.breaks.map((brk, index) => (
                                                        <span key={index} className="inline-flex items-center gap-2">
                                                            {`${brk.start} - ${brk.end}`}
                                                        </span>
                                                    )).reduce((prev, curr) => [prev, ', ', curr])}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamBusinessAvailability;
