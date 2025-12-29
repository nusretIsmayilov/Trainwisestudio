import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: ReactNode;
}

export default function ProtectedAuthRoute({ children }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  // Login değilse → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profil henüz yoksa → bekle
  if (!profile) {
    return null;
  }

  // Role seçilmemiş → izin ver
  if (!profile.role) {
    return <>{children}</>;
  }

  // Role var ama onboarding bitmemiş → izin ver
  if (!profile.onboarding_complete) {
    return <>{children}</>;
  }

  // Her şey tamamsa → dashboard
  return <Navigate to="/customer/dashboard" replace />;
}
