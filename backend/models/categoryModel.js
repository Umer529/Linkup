const { supabase: db } = require('../database/client');

// Fallback icon/color metadata keyed by lowercase category name
const CATEGORY_META = {
  hiking:        { icon: '🥾', color: 'from-green-400 to-emerald-600' },
  photography:   { icon: '📸', color: 'from-purple-400 to-violet-600' },
  cooking:       { icon: '🍳', color: 'from-orange-400 to-red-500' },
  sports:        { icon: '⚽', color: 'from-blue-400 to-cyan-500' },
  music:         { icon: '🎵', color: 'from-pink-400 to-rose-500' },
  art:           { icon: '🎨', color: 'from-yellow-400 to-amber-500' },
  gaming:        { icon: '🎮', color: 'from-indigo-400 to-purple-500' },
  yoga:          { icon: '🧘', color: 'from-teal-400 to-green-500' },
  'book club':   { icon: '📚', color: 'from-amber-400 to-yellow-500' },
  volunteering:  { icon: '🤝', color: 'from-red-400 to-pink-500' },
  fitness:       { icon: '💪', color: 'from-orange-500 to-yellow-400' },
  travel:        { icon: '✈️', color: 'from-sky-400 to-blue-500' },
  dance:         { icon: '💃', color: 'from-fuchsia-400 to-pink-500' },
  technology:    { icon: '💻', color: 'from-slate-400 to-gray-600' },
  food:          { icon: '🍕', color: 'from-orange-400 to-yellow-500' },
  outdoor:       { icon: '🌲', color: 'from-green-500 to-lime-500' },
};

const CategoryModel = {
  async findAll() {
    // Always compute live activity counts from the activities table
    const { data: activities } = await db.from('activities').select('category');
    const countMap = (activities || []).reduce((acc, a) => {
      if (a.category) acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {});

    // Try to use the categories table for display metadata
    const { data: dbCategories, error } = await db
      .from('categories')
      .select('*')
      .order('name');

    if (!error && dbCategories && dbCategories.length > 0) {
      // Merge DB rows with live counts
      return dbCategories.map((cat) => ({ ...cat, count: countMap[cat.name] || 0 }));
    }

    // categories table is empty — derive directly from activities so real data always shows
    return Object.entries(countMap)
      .map(([name], i) => {
        const meta = CATEGORY_META[name.toLowerCase()] || { icon: '🎯', color: '' };
        return {
          id: String(i + 1),
          name,
          icon: meta.icon,
          color: meta.color,
          count: countMap[name],
        };
      })
      .sort((a, b) => b.count - a.count);
  },

  async create(payload) {
    const { data, error } = await db.from('categories').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
};

module.exports = CategoryModel;
