import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, clearUser } from '../redux/slices/userSlice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import Link from 'next/link';

const Navbar = () => {
  const user = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      dispatch(logoutUser());
      await auth.signOut(); // Ensure Firebase auth sign out is also called
      localStorage.clear(); // Clear localStorage upon logout
      dispatch(clearUser()); // Clear user info from Redux state
      console.log('Logout successful.');
      router.replace('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Logout error:', error.message);
      // Handle logout error
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Dispatch setUser action or handle user initialization
      } else {
        // Dispatch clearUser action or handle logout state
      }
    });
    return () => unsubscribe();
  }, [dispatch]);
  
  return (
    <nav className="bg-custom-purple text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" passHref>
          <div className="text-xl font-bold cursor-pointer">BookMyAppointment</div>
        </Link>
        <div className="flex justify-center space-x-4">
        <Link href="/" passHref>
            <div className="cursor-pointer">Home</div>
          </Link>
          <Link href="#" passHref>
            <div className="cursor-pointer">About</div>
          </Link>
          <Link href="#" passHref>
            <div className="cursor-pointer">Services</div>
          </Link>
          <Link href="#" passHref>
            <div className="cursor-pointer">Service Listing</div>
          </Link>
          <Link href="#" passHref>
            <div className="cursor-pointer">Testimonials</div>
          </Link>
        </div>
        <div className="flex space-x-4">
          {user ? (
            <>
              <span className="mr-4">Hello, {user.email}</span>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <div className="bg-blue-500 px-3 py-1 rounded cursor-pointer">Login</div>
              </Link>
              <Link href="/register/business" passHref>
                <div className="bg-green-500 px-3 py-1 rounded cursor-pointer">Register Business</div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
