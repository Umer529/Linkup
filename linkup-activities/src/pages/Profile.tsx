import { useState } from 'react';
import { Calendar, Award, Flame, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ActivityCard from '@/components/ActivityCard';
import { currentUser, activities } from '@/lib/mock-data';

type Tab = 'upcoming' | 'hosted' | 'past' | 'saved';

const Profile = () => {
  const [tab, setTab] = useState<Tab>('upcoming');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'hosted', label: 'Hosted' },
    { key: 'past', label: 'Past' },
    { key: 'saved', label: 'Saved' },
  ];

  // Mock: just show different slices
  const displayActivities = tab === 'hosted' ? activities.slice(0, 2) : tab === 'past' ? activities.slice(3, 5) : tab === 'saved' ? activities.slice(1, 4) : activities.slice(0, 3);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 max-w-3xl pt-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 mb-4"
          />
          <h1 className="font-display text-2xl font-bold">{currentUser.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{currentUser.bio}</p>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="font-display text-xl font-bold">{currentUser.activitiesHosted}</div>
              <div className="text-xs text-muted-foreground">Hosted</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold">{currentUser.activitiesJoined}</div>
              <div className="text-xs text-muted-foreground">Joined</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold flex items-center gap-1">
                <Flame className="h-5 w-5 text-primary" />{currentUser.streak}
              </div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {currentUser.interests.map((i) => (
              <Badge key={i} variant="secondary">{i}</Badge>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <h3 className="font-display font-semibold mb-3">Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentUser.badges.map((b) => (
              <div key={b.id} className="bg-card rounded-xl border border-border p-3 text-center card-hover">
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="text-xs font-semibold">{b.name}</div>
                <div className="text-[10px] text-muted-foreground">{b.description}</div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Activities */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {displayActivities.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
