import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, setError, clearError } from '../../redux/slices/userSlice';
import { useRouter } from 'next/router';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Link from 'next/link';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const error = useSelector((state) => state.user.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if businessId exists in businesses collection
      const businessRef = doc(db, 'businesses', businessId);
      const businessDoc = await getDoc(businessRef);
      if (!businessDoc.exists()) {
        throw new Error('Business ID does not exist');
      }

      // Proceed with user registration
      const result = await dispatch(registerUser({ email, password, displayName, role: 'team', businessId }));
      setLoading(false);

      if (result.payload) {
        dispatch(clearError());
        setEmail('');
        setPassword('');
        setDisplayName('');
        setBusinessId('');

        // Redirect to team page after successful registration
        router.push('/team');
      } else {
        console.error('Registration failed:', result.error.message);
        dispatch(setError(result.error.message));
      }
    } catch (error) {
      setLoading(false);
      console.error('Registration failed:', error.message);
      dispatch(setError(error.message));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-custom-purple text-white shadow-2xl p-8 flex flex-col justify-start">
        <h1 className="text-3xl font-bold text-center mb-8">
          Sidebar Navigation
        </h1>
        <div className="grid grid-cols-1 gap-4">
          <Link href="/login">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Team Members
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
                Already have an account? Login instead.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="w-full lg:w-3/4 p-8 flex items-start justify-center">
        <div className="bg-white shadow-2xl rounded-lg p-8 flex flex-col justify-start w-full lg:max-w-4xl">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-700">Team Registration</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) dispatch(clearError());
                }}
                placeholder="Email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) dispatch(clearError());
                }}
                placeholder="Password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            {/* Display Name Field */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (error) dispatch(clearError());
                }}
                placeholder="Display Name"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            {/* Business ID Field */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="businessId">
                Business ID
              </label>
              <input
                type="text"
                id="businessId"
                value={businessId}
                onChange={(e) => {
                  setBusinessId(e.target.value);
                  if (error) dispatch(clearError());
                }}
                placeholder="Business ID"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
