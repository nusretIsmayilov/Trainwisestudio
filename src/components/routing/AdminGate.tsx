import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminGateProps {
  adminEmail?: string;
  children: React.ReactNode;
}

const AdminGate = ({ adminEmail, children }: AdminGateProps) => {
  const { profile, loading } = useAuth();
  const allowed = profile && ((profile as any).is_admin || (adminEmail ? profile.email === adminEmail : false));
  if (loading) return null;
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default AdminGate;


