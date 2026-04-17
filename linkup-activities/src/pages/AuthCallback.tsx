import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import supabase from '@/lib/supabase';
import { fetchMe } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    // Supabase puts the session in the URL hash after Google redirect.
    // getSession() reads it directly from the URL — no network call needed.
    supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (sessionError || !data.session) {
        setError('Sign-in failed. Please try again.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
        return;
      }

      try {
        await login(data.session.access_token, data.session.refresh_token);
        navigate('/', { replace: true });
      } catch {
        setError('Could not load your profile. Please try again.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Signing you in...</p>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
