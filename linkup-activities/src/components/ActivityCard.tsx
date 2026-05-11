import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, Clock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/lib/types';
import { getCategoryMeta } from '@/lib/utils';
import { toast } from 'sonner';
import { useJoinActivity, useLeaveActivity, useSaveActivity } from '@/hooks/useActivities';

interface ActivityCardProps {
  activity: Activity;
  isJoined?: boolean;
  isSaved?: boolean;
  isOwner?: boolean;
}

const difficultyColors = {
  easy: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  intense: 'bg-destructive/10 text-destructive border-destructive/20',
};

const ActivityCard = ({ activity, isJoined, isSaved, isOwner }: ActivityCardProps) => {
  const [saved, setSaved] = useState(isSaved ?? false);
  const [joined, setJoined] = useState(isJoined ?? false);

  useEffect(() => {
    if (isJoined !== undefined) setJoined(isJoined);
  }, [isJoined]);

  useEffect(() => {
    if (isSaved !== undefined) setSaved(isSaved);
  }, [isSaved]);

  const isFull = activity.current_participants >= activity.participant_limit;
  const meta = getCategoryMeta(activity.category);
  const host = activity.users;

  const joinMutation = useJoinActivity(activity.id);
  const leaveMutation = useLeaveActivity(activity.id);
  const saveMutation = useSaveActivity(activity.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prevSaved = saved;
    setSaved(!saved);
    try {
      await saveMutation.mutateAsync(saved);
      toast(saved ? 'Removed from saved' : 'Activity saved!', {
        description: saved ? undefined : 'Find it in your profile',
      });
    } catch {
      setSaved(prevSaved);
      toast.error('Could not save activity');
    }
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFull && !joined) return;
    const prevJoined = joined;
    try {
      if (joined) {
        setJoined(false);
        await leaveMutation.mutateAsync();
        toast('Left activity');
      } else {
        setJoined(true);
        await joinMutation.mutateAsync();
        toast(`🎉 You're in!`, { description: `You joined "${activity.title}"` });
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      const errorMsg = error?.response?.data?.error || 'Could not update participation';
      if (error?.response?.status === 409 && errorMsg === 'Already joined') {
        setJoined(true);
        toast.info('You are already in this activity');
      } else {
        setJoined(prevJoined);
        toast.error(errorMsg);
      }
    }
  };

  return (
    <Link to={`/activity/${activity.id}`} className="block">
      <div className="group bg-card rounded-2xl border border-border overflow-hidden card-hover">

        {/* Category gradient header */}
        <div className={`relative h-28 bg-gradient-to-br ${meta.gradient} flex items-center justify-center overflow-hidden`}>
          <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
            {meta.icon}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant="secondary" className="glass text-xs font-medium">{activity.category}</Badge>
            <Badge variant="secondary" className={`text-xs font-medium border ${difficultyColors[activity.difficulty]}`}>
              {activity.difficulty}
            </Badge>
          </div>

          {/* Save button top-right */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 p-1.5 rounded-full glass transition-all duration-200 hover:scale-110"
            aria-label={saved ? 'Unsave activity' : 'Save activity'}
          >
            {saved
              ? <BookmarkCheck className="h-4 w-4 text-primary" />
              : <Bookmark className="h-4 w-4 text-white" />}
          </button>

          {/* Host bottom-left */}
          {host && (
            <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/40">
                {host.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-white/90">{host.name}</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {activity.title}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{activity.time}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{activity.city}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{activity.current_participants}/{activity.participant_limit}</span>
              {isFull && !isOwner && <Badge variant="secondary" className="text-[10px] ml-1">Full</Badge>}
            </div>
            {isOwner ? (
              <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1.5">
                <Crown className="h-3.5 w-3.5" />
                Owner
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleJoin}
                disabled={(isFull && !joined) || joinMutation.isPending || leaveMutation.isPending}
                variant={joined ? 'outline' : 'default'}
                className={`text-xs h-8 ${!joined && !isFull ? 'gradient-bg border-0 text-primary-foreground btn-glow' : ''}`}
              >
                {joined ? 'Joined ✓' : isFull ? 'Full' : 'Join'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ActivityCard;
