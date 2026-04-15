import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/mock-data';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const steps = ['Basics', 'Details', 'Settings', 'Review'];

const CreateActivity = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    city: '',
    location: '',
    participantLimit: '10',
    difficulty: 'easy',
    tags: '' as string,
    safetyInstructions: '',
    isPublic: true,
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

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const publish = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    toast.success('Activity published! 🎉', { description: 'People can now discover and join your activity.' });
    setTimeout(() => navigate('/explore'), 1500);
  };

  const fieldError = (field: string) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 max-w-2xl pt-8 pb-12">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Create Activity</h1>
        <p className="text-muted-foreground text-sm mb-8">Share something amazing with the community</p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? 'gradient-bg text-primary-foreground'
                    : i === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
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
          {/* Step 0: Basics */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <Label>Activity Title *</Label>
                <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g., Sunrise Hike at the Peak" className="mt-1.5" maxLength={80} />
                <div className="flex justify-between">
                  {fieldError('title')}
                  <span className="text-xs text-muted-foreground ml-auto">{form.title.length}/80</span>
                </div>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe your activity..." className="mt-1.5 min-h-[120px]" maxLength={500} />
                <div className="flex justify-between">
                  {fieldError('description')}
                  <span className="text-xs text-muted-foreground ml-auto">{form.description.length}/500</span>
                </div>
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => update('category', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError('category')}
              </div>
              <div>
                <Label>Banner Image</Label>
                <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Details */}
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
                  <Input type="number" min="2" max="100" value={form.participantLimit} onChange={(e) => update('participantLimit', e.target.value)} className="mt-1.5" />
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

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label>Safety Instructions</Label>
                <Textarea value={form.safetyInstructions} onChange={(e) => update('safetyInstructions', e.target.value)} placeholder="Any safety info participants should know..." className="mt-1.5 min-h-[100px]" />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  {form.isPublic ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">{form.isPublic ? 'Public Activity' : 'Private Activity'}</p>
                    <p className="text-xs text-muted-foreground">{form.isPublic ? 'Anyone can discover and join' : 'Only invited people can join'}</p>
                  </div>
                </div>
                <Switch checked={form.isPublic} onCheckedChange={(v) => update('isPublic', v)} />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg">Review Your Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Title</span><span className="font-medium">{form.title || '—'}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Category</span><span className="font-medium">{form.category || '—'}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Date & Time</span><span className="font-medium">{form.date} at {form.time || '—'}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Location</span><span className="font-medium">{form.city}, {form.location || '—'}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Limit</span><span className="font-medium">{form.participantLimit} people</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Difficulty</span><span className="font-medium capitalize">{form.difficulty}</span></div>
                <div className="flex justify-between py-2"><span className="text-muted-foreground">Visibility</span><span className="font-medium">{form.isPublic ? 'Public' : 'Private'}</span></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={next} className="gradient-bg text-primary-foreground border-0">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={publish} className="gradient-bg text-primary-foreground border-0 btn-glow">
                Publish Activity 🚀
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;
