import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Bookmark, BookmarkCheck, ArrowLeft, Share2, Star, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import ActivityCard from '@/components/ActivityCard';
import SkeletonCard from '@/components/SkeletonCard';
import { useActivity, useJoinActivity, useLeaveActivity, useSaveActivity, useActivities } from '@/hooks/useActivities';
import { useReviews, useCreateReview } from '@/hooks/useReviews';
import { toast } from 'sonner';

const difficultyConfig = {
  easy: { label: 'Easy', color: 'bg-success/10 text-success' },
  moderate: { label: 'Moderate', color: 'bg-warning/10 text-warning' },
  intense: { label: 'Intense', color: 'bg-destructive/10 text-destructive' },
};

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: activity, isLoading } = useActivity(id!);
  const { data: reviews = [] } = useReviews(id!);
  const { data: allActivities = [] } = useActivities();

  const [joined, setJoined] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const joinMutation = useJoinActivity(id!);
  const leaveMutation = useLeaveActivity(id!);
  const saveMutation = useSaveActivity(id!);
  const createReview = useCreateReview(id!);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid sm:grid-cols-2 gap-6"><SkeletonCard /><SkeletonCard /></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-2xl font-bold mb-2">Activity not found</h2>
        <p className="text-muted-foreground mb-4">This activity may have been removed.</p>
        <Link to="/explore"><Button>Back to Explore</Button></Link>
      </div>
    );
  }

  const isFull = activity.current_participants >= activity.participant_limit;
  const diff = difficultyConfig[activity.difficulty];
  const host = activity.users;
  const similar = allActivities
    .filter((a: import('@/lib/types').Activity) => a.category === activity.category && a.id !== activity.id)
    .slice(0, 3);

  const handleJoin = async () => {
    try {
      if (joined) {
        await leaveMutation.mutateAsync();
        setJoined(false);
        toast('Left activity');
      } else {
        await joinMutation.mutateAsync();
        setJoined(true);
        toast('🎉 You\'re in!');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      toast.error(msg);
    }
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(saved);
      setSaved(!saved);
      toast(saved ? 'Removed from saved' : 'Saved!');
    } catch {
      toast.error('Could not save activity');
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) return;
    try {
      await createReview.mutateAsync({ rating: reviewRating, comment: reviewText });
      setReviewText('');
      setReviewRating(5);
      toast.success('Review posted!');
    } catch {
      toast.error('Could not post review');
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="relative h-64 md:h-96">
        <img src={activity.banner_image} alt={activity.title} className="w-full h-full object-cover" />
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
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{activity.current_participants}/{activity.participant_limit} joined</span>
          </div>

          <div className="flex gap-3 mb-8">
            <Button
              onClick={handleJoin}
              disabled={(isFull && !joined) || joinMutation.isPending || leaveMutation.isPending}
              className={`flex-1 h-11 ${!joined ? 'gradient-bg text-primary-foreground border-0 btn-glow' : ''}`}
              variant={joined ? 'outline' : 'default'}
            >
              {joined ? 'Leave Activity' : isFull ? 'Activity Full' : 'Join Activity'}
            </Button>
            <Button variant="outline" size="icon" onClick={handleSave} className="h-11 w-11">
              {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast('Link copied!'); }} className="h-11 w-11">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Separator className="mb-6" />

          {host && (
            <div className="flex items-center gap-3 mb-6">
              <img src={host.avatar} alt={host.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-sm">Hosted by {host.name}</p>
                <p className="text-xs text-muted-foreground">Community leader</p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="font-display font-semibold mb-2">About this activity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{activity.description}</p>
          </div>

          {activity.agenda && activity.agenda.length > 0 && (
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

          {activity.required_items && activity.required_items.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display font-semibold mb-3">What to Bring</h3>
              <div className="grid grid-cols-2 gap-2">
                {activity.required_items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activity.safety_instructions && (
            <div className="mb-8 p-4 bg-warning/5 rounded-xl border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="font-display font-semibold text-sm">Safety Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground">{activity.safety_instructions}</p>
            </div>
          )}

          {activity.rules && activity.rules.length > 0 && (
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

          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {activity.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          )}

          <Separator className="mb-8" />

          {/* Reviews */}
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-4">Reviews ({reviews.length})</h3>
            <div className="space-y-4 mb-6">
              {reviews.map((r: import('@/lib/types').Review) => (
                <div key={r.id} className="flex gap-3">
                  <img src={r.users?.avatar} alt={r.users?.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{r.users?.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Leave a review */}
            <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium">Leave a review</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)}>
                    <Star className={`h-5 w-5 transition-colors ${star <= reviewRating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="min-h-[80px]"
              />
              <Button
                size="sm"
                onClick={handleReviewSubmit}
                disabled={!reviewText.trim() || createReview.isPending}
                className="gradient-bg text-primary-foreground border-0"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Post Review
              </Button>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-12 mb-8">
            <h3 className="font-display text-xl font-bold mb-6">Similar Activities</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((a: import('@/lib/types').Activity) => <ActivityCard key={a.id} activity={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityDetail;
