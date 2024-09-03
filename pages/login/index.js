import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, setError, clearError } from '../../redux/slices/userSlice';
import { useRouter } from 'next/router';
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const error = useSelector((state) => state.user.error);
  const user = useSelector((state) => state.user.userInfo);

  // Redirect to appropriate page based on user role
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'team':
          router.push('/team');
          break;
        default:
          router.push('/');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(loginUser({ email, password }));
      setLoading(false);
      if (result.payload) {
        setEmail('');
        setPassword('');
        // User role will be handled by useEffect hook
      } else {
        dispatch(setError(result.error.message)); // Dispatch setError action
      }
    } catch (error) {
      setLoading(false);
      dispatch(setError(error.message)); // Dispatch setError action
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
          <Link href="/register/business">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Business Owner
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
                Register your Business.
              </p>
            </div>
          </Link>
          <Link href="/register/team">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Team Members
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
                Register as a Team Member for a particular business with provided Business ID.
              </p>
            </div>
          </Link>
          <Link href="/customer">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Customer
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
                Access the Customer Dashboard.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full lg:w-3/4 p-8 flex items-start justify-center">
        <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-700">Login Page</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
