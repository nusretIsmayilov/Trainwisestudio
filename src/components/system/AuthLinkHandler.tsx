import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Handles Supabase magic link/hash params by setting the session and redirecting
const AuthLinkHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = location.hash || '';
      if (!hash.startsWith('#')) return;

      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const type = params.get('type');

      if (access_token && refresh_token) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            if (type === 'recovery') {
              navigate('/recovery-expired', { replace: true });
            } else {
              navigate('/login?error=auth_failed', { replace: true });
            }
            return;
          }

          // Recovery flow: force update-password
          if (type === 'recovery') {
            try { sessionStorage.setItem('recoveryFlow', '1'); } catch {}
            navigate('/update-password', { replace: true });
            return;
          }

          // 🔥 NON-RECOVERY CASE
          // 👉 URL'yi temizle ama onboarding step'ine KARIŞMA
          // Non-recovery: Clean URL and choose safe landing
const cleanPath = location.pathname + location.search;

if (cleanPath === '/' || cleanPath === '') {
  navigate('/onboarding/step-0', { replace: true });
} else {
  navigate(cleanPath, { replace: true });
}

return;


          // ❌ onboarding step redirect TAMAMEN KALDIRILDI
          return;
        } catch (error) {
          navigate('/login?error=auth_failed', { replace: true });
        }
      }

      if (type === 'recovery') {
        try { sessionStorage.setItem('recoveryFlow', '1'); } catch {}
        navigate('/update-password', { replace: true });
      }
    };

    handleAuthCallback();
  }, [location.hash, location.pathname, location.search, navigate]);

  return null;
};

export default AuthLinkHandler;
