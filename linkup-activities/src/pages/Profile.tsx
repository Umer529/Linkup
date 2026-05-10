import { useState } from 'react';
import { Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ActivityCard from '@/components/ActivityCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import { useUser, useUserActivities, useSavedActivities, useJoinedActivities } from '@/hooks/useUser';
import { Activity } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

type Tab = 'upcoming' | 'hosted' | 'saved';

const Profile = () => {
  const { user: authUser } = useAuth();
  const CURRENT_USER_ID = authUser?.id ?? '';
  const [tab, setTab] = useState<Tab>('upcoming');

  const { data: user, isLoading: userLoading } = useUser(CURRENT_USER_ID);
  const { data: hostedActivities = [], isLoading: hostedLoading } = useUserActivities(CURRENT_USER_ID);
  const { data: savedActivities = [], isLoading: savedLoading } = useSavedActivities(CURRENT_USER_ID);
  const { data: joinedActivities = [], isLoading: joinedLoading } = useJoinedActivities(CURRENT_USER_ID);

  const upcomingActivities = (joinedActivities as Activity[]).filter(
    (a: Activity) => new Date(a.date) >= new Date()
  );

  const joinedIdsSet = new Set((joinedActivities as Activity[]).map((a) => a.id));
  const savedIdsSet = new Set((savedActivities as Activity[]).map((a) => a.id));

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'hosted', label: 'Hosted' },
    { key: 'saved', label: 'Saved' },
  ];

  const displayActivities =
    tab === 'hosted' ? hostedActivities :
    tab === 'saved' ? savedActivities :
    upcomingActivities;

  const isLoading =
    tab === 'hosted' ? hostedLoading :
    tab === 'saved' ? savedLoading :
    joinedLoading;

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 max-w-3xl pt-8">
        <div className="grid sm:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 max-w-3xl pt-8">
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 mb-4"
          />
          <h1 className="font-display text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{user.bio}</p>

          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="font-display text-xl font-bold">{user.activities_hosted}</div>
              <div className="text-xs text-muted-foreground">Hosted</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold">{user.activities_joined}</div>
              <div className="text-xs text-muted-foreground">Joined</div>
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-bold flex items-center gap-1">
                <Flame className="h-5 w-5 text-primary" />{user.streak}
              </div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {user.interests?.map((i: string) => (
              <Badge key={i} variant="secondary">{i}</Badge>
            ))}
          </div>
        </div>

        {user.badges?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-3">Achievements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {user.badges.map((b: { id: string; icon: string; name: string; description: string }) => (
                <div key={b.id} className="bg-card rounded-xl border border-border p-3 text-center card-hover">
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <div className="text-xs font-semibold">{b.name}</div>
                  <div className="text-[10px] text-muted-foreground">{b.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="mb-6" />

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

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : displayActivities.length === 0 ? (
          <EmptyState title="No activities yet" description="Activities will appear here once available." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {displayActivities.map((a: Activity) => (
              <ActivityCard
                key={a.id}
                activity={a}
                isJoined={tab === 'upcoming' ? true : joinedIdsSet.has(a.id)}
                isSaved={tab === 'saved' ? true : savedIdsSet.has(a.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
