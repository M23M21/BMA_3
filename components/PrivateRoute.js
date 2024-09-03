import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, role }) => {
  const router = useRouter();
  const user = useSelector((state) => state.user.userInfo);
  const isAuthorized = user && (!role || user.role === role);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (role && user.role !== role) {
      router.replace('/');
    }
  }, [user, role, router]);

  // Return null or a loading indicator while the redirect is happening
  if (!isAuthorized) {
    return null;
  }

  return children;
};

export default PrivateRoute;
