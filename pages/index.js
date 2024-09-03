import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar Form */}
      <div className="w-full lg:w-1/4 bg-custom-purple text-white shadow-2xl p-8 flex flex-col justify-start">
        <h1 className="text-3xl font-bold text-center mb-8">
          Sidebar Navigation
        </h1>
        <div className="grid grid-cols-1 gap-4">
          <Link href="/admin">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Business Owner
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
                Access the Business Owner Dashboard.
              </p>
            </div>
          </Link>
          <Link href="/team">
            <div className="group cursor-pointer rounded-lg border-2 border-white bg-custom-purple p-6 transition-colors hover:bg-purple-700 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-white text-center">
                Team Member
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-200 text-center">
                Access the Team Member Dashboard.
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

      {/* Main Content Form */}
      <div className="w-full lg:w-3/4 p-8 flex items-start justify-center">
        <div className="bg-white shadow-2xl rounded-lg p-8 flex flex-col justify-start w-full lg:max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-purple-700">
            Welcome to BookMyAppointment
          </h1>
          <div className="grid grid-cols-1 gap-4">
            <div className="group cursor-pointer rounded-lg border-2 border-gray-300 bg-white p-6 transition-colors hover:bg-gray-100 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-gray-800 text-center">
                Introduction
              </h2>
              <p className="m-0 text-sm text-gray-600 text-center">
                Book My Appointment is an online appointment booking platform designed to streamline the process of scheduling appointments for various services.
              </p>
            </div>

            <div className="group cursor-pointer rounded-lg border-2 border-gray-300 bg-white p-6 transition-colors hover:bg-gray-100 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-gray-800 text-center">
                Purpose
              </h2>
              <p className="m-0 text-sm text-gray-600 text-center">
                To create a user-friendly, robust, and scalable appointment booking system that allows business owners and teams to set their availability and manage customer appointments efficiently.
              </p>
            </div>

            <div className="group cursor-pointer rounded-lg border-2 border-gray-300 bg-white p-6 transition-colors hover:bg-gray-100 hover:shadow-lg">
              <h2 className="mb-3 text-2xl font-semibold text-gray-800 text-center">
                Target Audience
              </h2>
              <p className="m-0 text-sm text-gray-600 text-center">
                Individuals and SMEs requiring appointment booking capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
