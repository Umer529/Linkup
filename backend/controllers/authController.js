const { supabaseAuth, supabase: db } = require('../database/client');

const authController = {
  // Send email OTP
  async sendOtp(req, res) {
    const { email } = req.body;
    if (!email) return res.status(422).json({ error: 'Email is required' });

    const { error } = await supabaseAuth.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: `Verification code sent to ${email}` });
  },

  // Verify email OTP → return session
  async verifyOtp(req, res) {
    const { email, token } = req.body;
    if (!email || !token) return res.status(422).json({ error: 'email and token are required' });

    const { data, error } = await supabaseAuth.auth.verifyOtp({ email, token, type: 'email' });
    if (error || !data.session) {
      return res.status(400).json({ error: error?.message || 'Invalid or expired code' });
    }

    // Upsert user row — safe to call on every login
    await db.from('users').upsert({
      id: data.user.id,
      name: data.user.user_metadata?.full_name || email.split('@')[0],
      avatar: data.user.user_metadata?.avatar_url || null,
      interests: [],
      activities_hosted: 0,
      activities_joined: 0,
      streak: 0,
    }, { onConflict: 'id', ignoreDuplicates: true });

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email },
    });
  },

  // Refresh session
  async refresh(req, res) {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(422).json({ error: 'refresh_token required' });

    const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token });
    if (error || !data.session) {
      return res.status(401).json({ error: 'Session expired, please log in again' });
    }

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  },

  // Get current user's profile row — creates it if first Google login
  async me(req, res) {
    try {
      const userId = req.user.id;
      const meta = req.user.user_metadata || {};

      const userPayload = {
        id: userId,
        name: meta.full_name || meta.name || req.user.email?.split('@')[0] || 'User',
        avatar: meta.avatar_url || meta.picture || null,
        interests: [],
        activities_hosted: 0,
        activities_joined: 0,
        streak: 0,
      };

      const { error: upsertError } = await db.from('users').upsert(userPayload, {
        onConflict: 'id',
        ignoreDuplicates: true,
      });
      if (upsertError) throw upsertError;

      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;

      res.json({ data });
    } catch (err) {
      console.error('Auth /me error:', err);
      res.status(500).json({ error: err.message || 'Unexpected server error' });
    }
  },
};

module.exports = authController;
