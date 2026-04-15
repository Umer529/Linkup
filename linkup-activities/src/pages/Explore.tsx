import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ActivityCard from '@/components/ActivityCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import { activities, categories } from '@/lib/mock-data';

const cities = ['All', 'San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Austin', 'Portland', 'San Diego', 'Seattle'];

const Explore = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'All' || a.category === selectedCategory;
      const matchCity = selectedCity === 'All' || a.city === selectedCity;
      return matchSearch && matchCategory && matchCity;
    });
  }, [search, selectedCategory, selectedCity]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCity('All');
  };

  const hasFilters = search || selectedCategory !== 'All' || selectedCity !== 'All';

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 pt-8 pb-4">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Explore Activities</h1>
          <p className="text-muted-foreground text-sm mb-6">Find your next adventure</p>

          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 rounded-xl"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 animate-fade-in pb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === 'All' ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('All')}
                  >
                    All
                  </Badge>
                  {categories.map((c) => (
                    <Badge
                      key={c.id}
                      variant={selectedCategory === c.name ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(c.name)}
                    >
                      {c.icon} {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">City</label>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Badge
                      key={city}
                      variant={selectedCity === city ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCity(city)}
                    >
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-primary hover:underline mb-2">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No activities found"
            description="Try adjusting your filters or search term"
            action={{ label: 'Clear Filters', onClick: clearFilters }}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} activities found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
