const { supabase: db } = require('../database/client');

const todayStr = () => new Date().toISOString().split('T')[0];

const adminController = {
  async getStats(req, res) {
    try {
      const [usersRes, activitiesRes, reportsRes] = await Promise.all([
        db.from('users').select('*', { count: 'exact', head: true }),
        db.from('activities').select('*', { count: 'exact', head: true }).gte('date', todayStr()),
        db.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      res.json({
        data: {
          users: usersRes.count ?? 0,
          activities: activitiesRes.count ?? 0,
          reports: reportsRes.error ? 0 : (reportsRes.count ?? 0),
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getEngagement(req, res) {
    try {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const since = days[0] + 'T00:00:00.000Z';
      const { data, error } = await db
        .from('participants')
        .select('created_at')
        .gte('created_at', since);

      if (error) throw error;

      const counts = days.map((day) => ({
        day,
        count: (data || []).filter((p) => p.created_at?.startsWith(day)).length,
      }));

      res.json({ data: counts });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getReports(req, res) {
    try {
      const { data, error } = await db
        .from('reports')
        .select('*, activities(title), users(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ data: data || [] });
    } catch {
      // reports table may not exist yet
      res.json({ data: [] });
    }
  },

  async resolveReport(req, res) {
    try {
      const { data, error } = await db
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      res.json({ data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = adminController;
