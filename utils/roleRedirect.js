// utils/roleRedirect.js
export const roleRedirect = (user, router) => {
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'team':
          router.push('/team');
          break;
        case 'customer':
          router.push('/customer');
          break;
        default:
          router.push('/');
      }
    }
  };
  