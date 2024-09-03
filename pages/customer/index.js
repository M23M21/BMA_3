import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';

const CustomerPage = () => {
  const user = useSelector((state) => state.user.userInfo);
  const router = useRouter();

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'team')) {
      // Redirect to a different page if the user is not allowed to access this page
      router.replace('/'); // You can change this to another page, such as an error page or a home page
    }
  }, [user, router]);

  // You can also render a loading state while the redirection is happening
  if (user && (user.role === 'admin' || user.role === 'team')) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-custom-purple text-white shadow-2xl p-8 flex flex-col justify-start">
        <h1 className="text-3xl font-bold text-center mb-8">
          Customer Sidebar
        </h1>
        <div className="grid grid-cols-1 gap-4">
        <Link href="/customer">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Customer Home
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
                Customer Home page.
              </p>
            </div>
          </Link>
          <Link href="/customer/booking">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Customer Booking
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
                Access the Booking page with provided BusinessID.
              </p>
            </div>
          </Link>
          <Link href="/customer/appointments">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Customer Appointments
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
              Access the Appointments page with provided BusinessID and User details.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4 p-8 flex flex-col items-start justify-start">
        <div className="bg-white shadow-2xl rounded-lg p-8 w-full">
          {/* Add a welcome message or instructions here */}
          <h2 className="text-2xl font-bold mb-4">Welcome to the Customer Page</h2>
          <p>Please select an option from the sidebar to get started.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
