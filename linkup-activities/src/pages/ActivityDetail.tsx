import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Bookmark, BookmarkCheck, ArrowLeft, Share2, Star, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ActivityCard from '@/components/ActivityCard';
import { activities, reviews } from '@/lib/mock-data';
import { toast } from 'sonner';

const difficultyConfig = {
  easy: { label: 'Easy', color: 'bg-success/10 text-success' },
  moderate: { label: 'Moderate', color: 'bg-warning/10 text-warning' },
  intense: { label: 'Intense', color: 'bg-destructive/10 text-destructive' },
};

const ActivityDetail = () => {
  const { id } = useParams();
  const activity = activities.find((a) => a.id === id);
  const [joined, setJoined] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold mb-2">Activity not found</h2>
        <p className="text-muted-foreground mb-4">This activity may have been removed.</p>
        <Link to="/explore"><Button>Back to Explore</Button></Link>
      </div>
    );
  }

  const isFull = activity.currentParticipants >= activity.participantLimit;
  const similar = activities.filter((a) => a.category === activity.category && a.id !== activity.id).slice(0, 3);
  const diff = difficultyConfig[activity.difficulty];

  const handleJoin = () => {
    if (isFull) return;
    setJoined(!joined);
    toast(joined ? 'Left activity' : '🎉 You\'re in!');
  };

  const handleSave = () => {
    setSaved(!saved);
    toast(saved ? 'Removed from saved' : 'Saved!');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Cover */}
      <div className="relative h-64 md:h-96">
        <img src={activity.bannerImage} alt={activity.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link to="/explore">
            <Button variant="outline" size="sm" className="glass border-0">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative max-w-4xl">
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge>{activity.category}</Badge>
            <Badge variant="secondary" className={diff.color}>{diff.label}</Badge>
            {isFull && <Badge variant="destructive">Full</Badge>}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">{activity.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{activity.time}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{activity.location}, {activity.city}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{activity.currentParticipants}/{activity.participantLimit} joined</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <Button
              onClick={handleJoin}
              disabled={isFull && !joined}
              className={`flex-1 h-11 ${!joined ? 'gradient-bg text-primary-foreground border-0 btn-glow' : ''}`}
              variant={joined ? 'outline' : 'default'}
            >
              {joined ? 'Leave Activity' : isFull ? 'Activity Full' : 'Join Activity'}
            </Button>
            <Button variant="outline" size="icon" onClick={handleSave} className="h-11 w-11">
              {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => toast('Link copied!')} className="h-11 w-11">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Separator className="mb-6" />

          {/* Host */}
          <div className="flex items-center gap-3 mb-6">
            <img src={activity.hostAvatar} alt={activity.hostName} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-sm">Hosted by {activity.hostName}</p>
              <p className="text-xs text-muted-foreground">Community leader</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-2">About this activity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{activity.description}</p>
          </div>

          {/* Agenda */}
          {activity.agenda && (
            <div className="mb-8">
              <h3 className="font-display font-semibold mb-3">Agenda</h3>
              <div className="space-y-2">
                {activity.agenda.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Items */}
          {activity.requiredItems && (
            <div className="mb-8">
              <h3 className="font-display font-semibold mb-3">What to Bring</h3>
              <div className="grid grid-cols-2 gap-2">
                {activity.requiredItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety */}
          {activity.safetyInstructions && (
            <div className="mb-8 p-4 bg-warning/5 rounded-xl border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="font-display font-semibold text-sm">Safety Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground">{activity.safetyInstructions}</p>
            </div>
          )}

          {/* Rules */}
          {activity.rules && (
            <div className="mb-8">
              <h3 className="font-display font-semibold mb-3">Rules</h3>
              <ul className="space-y-1.5">
                {activity.rules.map((rule, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-primary">•</span> {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {activity.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
            ))}
          </div>

          <Separator className="mb-8" />

          {/* Reviews */}
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-4">Reviews</h3>
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <img src={r.userAvatar} alt={r.userName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{r.userName}</span>
                      <div className="flex gap-0.5">{Array.from({length: r.rating}).map((_, i) => <Star key={i} className="h-3 w-3 fill-warning text-warning" />)}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-12 mb-8">
            <h3 className="font-display text-xl font-bold mb-6">Similar Activities</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((a) => <ActivityCard key={a.id} activity={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityDetail;
