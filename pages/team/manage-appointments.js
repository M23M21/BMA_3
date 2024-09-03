import Link from 'next/link';
import TeamAppointments from '@/components/Team/TeamAppointments';
import PrivateRoute from '../../components/PrivateRoute';

const TeamManageAppointmentsPage = () => {
  return (
    <PrivateRoute role="team">

    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-custom-purple text-white shadow-2xl p-8 flex flex-col justify-start">
        <h1 className="text-3xl font-bold text-center mb-8">
          Business Owner Sidebar
        </h1>
        <div className="grid grid-cols-1 gap-4">
          <Link href="/team">
              <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
                <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                  Team Members Home
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h2>
                <p className="m-0 text-sm text-gray-200 text-center">
                  Team Members Home page.
                </p>
              </div>
            </Link>
            <Link href="/team/business-details">
              <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
                <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                  Overview Business
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h2>
                <p className="m-0 text-sm text-gray-200 text-center">
                  Overview Business Details.
                </p>
              </div>
            </Link>
            <Link href="/team/availability">
              <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
                <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                  Manage Availability
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h2>
                <p className="m-0 text-sm text-gray-200 text-center">
                  Set your personal availability.
                </p>
              </div>
            </Link>

            <Link href="/team/manage-appointments">
              <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
                <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                  Manage Appointments
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h2>
                <p className="m-0 text-sm text-gray-200 text-center">
                  Manage your personal appointments.
                </p>
              </div>
            </Link>

            {/* Add more links here as needed */}
          </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4 p-8 flex flex-col items-start justify-start">
        <div className="bg-white shadow-2xl rounded-lg p-8 w-full">
        <TeamAppointments />

        </div>
      </div>
    </div>
        </PrivateRoute>

  );
};

export default TeamManageAppointmentsPage;
