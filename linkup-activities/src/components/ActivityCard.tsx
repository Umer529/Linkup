import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/lib/types';
import { toast } from 'sonner';

interface ActivityCardProps {
  activity: Activity;
}

const difficultyColors = {
  easy: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  intense: 'bg-destructive/10 text-destructive border-destructive/20',
};

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const [saved, setSaved] = useState(false);
  const [joined, setJoined] = useState(false);
  const isFull = activity.currentParticipants >= activity.participantLimit;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setSaved(!saved);
    toast(saved ? 'Removed from saved' : 'Activity saved!', {
      description: saved ? undefined : 'Find it in your profile',
    });
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFull) return;
    setJoined(!joined);
    toast(joined ? 'Left activity' : '🎉 You\'re in!', {
      description: joined ? undefined : `You joined "${activity.title}"`,
    });
  };

  return (
    <Link to={`/activity/${activity.id}`} className="block">
      <div className="group bg-card rounded-2xl border border-border overflow-hidden card-hover">
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={activity.bannerImage}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="glass text-xs font-medium">
              {activity.category}
            </Badge>
            <Badge variant="secondary" className={`text-xs font-medium border ${difficultyColors[activity.difficulty]}`}>
              {activity.difficulty}
            </Badge>
          </div>
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 p-2 rounded-full glass transition-all duration-200 hover:scale-110"
            aria-label={saved ? 'Unsave activity' : 'Save activity'}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4 text-foreground" />
            )}
          </button>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <img
                src={activity.hostAvatar}
                alt={activity.hostName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-background"
              />
              <span className="text-xs font-medium text-primary-foreground">{activity.hostName}</span>
            </div>
          </div>
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
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {activity.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {activity.city}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{activity.currentParticipants}/{activity.participantLimit}</span>
              {isFull && <Badge variant="secondary" className="text-[10px] ml-1">Full</Badge>}
            </div>
            <Button
              size="sm"
              onClick={handleJoin}
              disabled={isFull && !joined}
              variant={joined ? "outline" : "default"}
              className={`text-xs h-8 ${!joined && !isFull ? 'gradient-bg border-0 text-primary-foreground btn-glow' : ''}`}
            >
              {joined ? 'Joined ✓' : isFull ? 'Full' : 'Join'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ActivityCard;
