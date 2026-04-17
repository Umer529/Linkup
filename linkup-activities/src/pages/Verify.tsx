import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyOtp, sendOtp } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const state = location.state as { email?: string; from?: string } | null;
  const email = state?.email || '';
  const from = state?.from || '/';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    setCode(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (next.every((d) => d !== '')) handleVerify(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (token: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await verifyOtp(email, token);
      await login(data.access_token, data.refresh_token);
      toast.success('Welcome to LinkUp! 🎉');
      navigate(from, { replace: true });
    } catch {
      toast.error('Invalid or expired code. Try again.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOtp(email);
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      toast.success('New code sent!');
    } catch {
      toast.error('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="font-display font-bold text-2xl">LinkUp</span>
          </Link>
          <h1 className="font-display text-2xl font-bold mb-1">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background transition-all outline-none
                  ${digit ? 'border-primary text-primary' : 'border-border text-foreground'}
                  focus:border-primary focus:ring-2 focus:ring-primary/20`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <Button
            onClick={() => handleVerify(code.join(''))}
            disabled={code.some((d) => !d) || loading}
            className="w-full h-11 gradient-bg text-primary-foreground border-0 btn-glow mb-4"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Continue'}
          </Button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-xs text-muted-foreground">Resend code in {countdown}s</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
              >
                <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                Resend code
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto mt-6 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Use a different email
        </button>
      </div>
    </div>
  );
};

export default Verify;
