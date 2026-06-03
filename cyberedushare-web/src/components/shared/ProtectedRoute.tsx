import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRoleHomePath } from '../../utils/auth';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
