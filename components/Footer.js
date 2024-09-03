// components/Footer.js

const Footer = () => {
  return (
    <footer className="bg-custom-purple text-white p-4 text-center">
      <div className="container mx-auto">
        &copy; {new Date().getFullYear()} BookMyAppointment. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
