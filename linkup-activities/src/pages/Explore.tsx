import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ActivityCard from '@/components/ActivityCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import { useActivities } from '@/hooks/useActivities';
import { useCategories } from '@/hooks/useCategories';
import { useJoinedActivities, useSavedActivities } from '@/hooks/useUser';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Activity } from '@/lib/types';
import { cn } from '@/lib/utils';

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Hiking', icon: '🥾' },
  { id: '2', name: 'Photography', icon: '📸' },
  { id: '3', name: 'Cooking', icon: '🍳' },
  { id: '4', name: 'Sports', icon: '⚽' },
  { id: '5', name: 'Music', icon: '🎵' },
  { id: '6', name: 'Art', icon: '🎨' },
  { id: '7', name: 'Gaming', icon: '🎮' },
  { id: '8', name: 'Yoga', icon: '🧘' },
  { id: '9', name: 'Book Club', icon: '📚' },
  { id: '10', name: 'Volunteering', icon: '🤝' },
];

const difficulties = ['easy', 'moderate', 'intense'];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const activeCategoryRef = useRef<HTMLButtonElement>(null);

  const { user: authUser } = useAuth();
  const userId = authUser?.id ?? '';
  const { data: joinedActivities = [] } = useJoinedActivities(userId);
  const { data: savedActivities = [] } = useSavedActivities(userId);
  const joinedIdsSet = new Set((joinedActivities as Activity[]).map((a) => a.id));
  const savedIdsSet = new Set((savedActivities as Activity[]).map((a) => a.id));

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat !== null) setSelectedCategory(cat);
    if (q !== null) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    activeCategoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selectedCategory]);

  const handleCategorySelect = (name: string) => {
    setSelectedCategory(name);
    const next = new URLSearchParams(searchParams);
    if (name) {
      next.set('category', name);
    } else {
      next.delete('category');
    }
    setSearchParams(next, { replace: true });
  };

  const { data: apiCategories = [] } = useCategories();
  const categories = apiCategories.length > 0 ? apiCategories : FALLBACK_CATEGORIES;
  const { data: activities = [], isLoading } = useActivities({
    search: search || undefined,
    category: selectedCategory || undefined,
    city: selectedCity || undefined,
    difficulty: selectedDifficulty || undefined,
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedDifficulty('');
    setSearchParams({}, { replace: true });
  };

  const hasFilters = search || selectedCategory || selectedCity || selectedDifficulty;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 pt-8 pb-4">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Explore Activities</h1>
          <p className="text-muted-foreground text-sm mb-6">Find your next adventure</p>

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

          {/* Category pill bar — always visible */}
          <div className="relative mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
              <button
                ref={selectedCategory === '' ? activeCategoryRef : undefined}
                onClick={() => handleCategorySelect('')}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  selectedCategory === ''
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                ✦ All
              </button>
              {categories.map((c: { id: string; name: string; icon: string }) => {
                const isActive = selectedCategory === c.name;
                return (
                  <button
                    key={c.id}
                    ref={isActive ? activeCategoryRef : undefined}
                    onClick={() => handleCategorySelect(c.name)}
                    className={cn(
                      'flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    <span>{c.icon}</span>
                    {c.name}
                  </button>
                );
              })}
            </div>
            {/* fade edge to hint at scroll */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background/80 to-transparent" />
          </div>

          {showFilters && (
            <div className="space-y-4 animate-fade-in pb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={!selectedDifficulty ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setSelectedDifficulty('')}
                  >
                    All
                  </Badge>
                  {difficulties.map((d) => (
                    <Badge
                      key={d}
                      variant={selectedDifficulty === d ? 'default' : 'secondary'}
                      className="cursor-pointer capitalize"
                      onClick={() => setSelectedDifficulty(d)}
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">City</label>
                <Input
                  placeholder="Filter by city..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="max-w-xs h-9 rounded-xl"
                />
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

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            title="No activities found"
            description="Try adjusting your filters or search term"
            action={{ label: 'Clear Filters', onClick: clearFilters }}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{activities.length} activities found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activities.map((a: Activity) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  isJoined={joinedIdsSet.has(a.id)}
                  isSaved={savedIdsSet.has(a.id)}
                  isOwner={a.host_id === authUser?.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
