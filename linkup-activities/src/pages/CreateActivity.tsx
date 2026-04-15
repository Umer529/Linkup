import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useCreateActivity } from '@/hooks/useActivities';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const steps = ['Basics', 'Details', 'Settings', 'Review'];

const CreateActivity = () => {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const createActivity = useCreateActivity();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    city: '',
    location: '',
    participant_limit: '10',
    difficulty: 'easy',
    tags: '',
    safety_instructions: '',
    is_public: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.title.trim()) e.title = 'Title is required';
      if (!form.description.trim()) e.description = 'Description is required';
      if (!form.category) e.category = 'Category is required';
    }
    if (step === 1) {
      if (!form.date) e.date = 'Date is required';
      if (!form.time) e.time = 'Time is required';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.location.trim()) e.location = 'Location is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 3)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const publish = async () => {
    try {
      await createActivity.mutateAsync({
        ...form,
        participant_limit: parseInt(form.participant_limit, 10),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success('Activity published! 🎉', { description: 'People can now discover and join your activity.' });
      setTimeout(() => navigate('/explore'), 1500);
    } catch {
      toast.error('Failed to publish activity. Please try again.');
    }
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 max-w-2xl pt-8 pb-12">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Create Activity</h1>
        <p className="text-muted-foreground text-sm mb-8">Share something amazing with the community</p>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'gradient-bg text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 rounded ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <Label>Activity Title *</Label>
                <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g., Sunrise Hike at the Peak" className="mt-1.5" maxLength={80} />
                <div className="flex justify-between">{fieldError('title')}<span className="text-xs text-muted-foreground ml-auto">{form.title.length}/80</span></div>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe your activity..." className="mt-1.5 min-h-[120px]" maxLength={500} />
                <div className="flex justify-between">{fieldError('description')}<span className="text-xs text-muted-foreground ml-auto">{form.description.length}/500</span></div>
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => update('category', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c: { id: string; name: string; icon: string }) => (
                      <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError('category')}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="mt-1.5" />
                  {fieldError('date')}
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} className="mt-1.5" />
                  {fieldError('time')}
                </div>
              </div>
              <div>
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="e.g., San Francisco" className="mt-1.5" />
                {fieldError('city')}
              </div>
              <div>
                <Label>Meetup Location *</Label>
                <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g., Main Entrance, Central Park" className="mt-1.5" />
                {fieldError('location')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Participant Limit</Label>
                  <Input type="number" min="2" max="500" value={form.participant_limit} onChange={(e) => update('participant_limit', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={(v) => update('difficulty', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">🟢 Easy</SelectItem>
                      <SelectItem value="moderate">🟡 Moderate</SelectItem>
                      <SelectItem value="intense">🔴 Intense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <Input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="outdoor, nature, fitness (comma separated)" className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label>Safety Instructions</Label>
                <Textarea value={form.safety_instructions} onChange={(e) => update('safety_instructions', e.target.value)} placeholder="Any safety info participants should know..." className="mt-1.5 min-h-[100px]" />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  {form.is_public ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">{form.is_public ? 'Public Activity' : 'Private Activity'}</p>
                    <p className="text-xs text-muted-foreground">{form.is_public ? 'Anyone can discover and join' : 'Only invited people can join'}</p>
                  </div>
                </div>
                <Switch checked={form.is_public} onCheckedChange={(v) => update('is_public', v)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg">Review Your Activity</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Title', form.title],
                  ['Category', form.category],
                  ['Date & Time', `${form.date} at ${form.time}`],
                  ['Location', `${form.city}, ${form.location}`],
                  ['Limit', `${form.participant_limit} people`],
                  ['Difficulty', form.difficulty],
                  ['Visibility', form.is_public ? 'Public' : 'Private'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium capitalize">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={next} className="gradient-bg text-primary-foreground border-0">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={publish} disabled={createActivity.isPending} className="gradient-bg text-primary-foreground border-0 btn-glow">
                {createActivity.isPending ? 'Publishing...' : 'Publish Activity 🚀'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;
