import { useState } from 'react';
import { Users, Activity, Flag, BarChart3, Search, Eye, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SkeletonCard from '@/components/SkeletonCard';
import { useActivities, useDeleteActivity } from '@/hooks/useActivities';
import { Activity as ActivityType } from '@/lib/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Users', value: '12,483', icon: Users, change: '+12%' },
  { label: 'Active Activities', value: '3,247', icon: Activity, change: '+8%' },
  { label: 'Reports', value: '23', icon: Flag, change: '-5%' },
  { label: 'Engagement', value: '89%', icon: BarChart3, change: '+3%' },
];

const reports = [
  { id: '1', type: 'Spam', activity: 'Free Money Event', reporter: 'User #432', status: 'pending' },
  { id: '2', type: 'Inappropriate', activity: 'Late Night Meetup', reporter: 'User #891', status: 'pending' },
  { id: '3', type: 'Safety', activity: 'Extreme Cliff Jumping', reporter: 'User #127', status: 'reviewed' },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'reports'>('overview');
  const [search, setSearch] = useState('');

  const { data: activities = [], isLoading } = useActivities({ search: search || undefined });
  const deleteActivity = useDeleteActivity();

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity.mutateAsync(id);
      toast.success('Activity removed');
    } catch {
      toast.error('Failed to remove activity');
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mb-6">Manage your platform</p>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 max-w-md">
          {(['overview', 'activities', 'reports'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-card rounded-2xl border border-border p-5 card-hover">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs text-success">{s.change}</Badge>
                    </div>
                    <div className="font-display text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 mb-8">
              <h3 className="font-display font-semibold mb-4">User Engagement (Last 7 Days)</h3>
              <div className="flex items-end gap-2 h-40">
                {[65, 78, 52, 90, 85, 72, 95].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg gradient-bg transition-all" style={{ height: `${v}%` }} />
                    <span className="text-[10px] text-muted-foreground">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="animate-fade-in">
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities..." className="pl-10" />
              </div>
            </div>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Activity</th>
                        <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Host</th>
                        <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Participants</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((a: ActivityType) => (
                        <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{a.title}</td>
                          <td className="p-4 text-muted-foreground hidden md:table-cell">{a.users?.name ?? '—'}</td>
                          <td className="p-4 hidden sm:table-cell"><Badge variant="secondary">{a.category}</Badge></td>
                          <td className="p-4 text-muted-foreground">{a.current_participants}/{a.participant_limit}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Link to={`/activity/${a.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDelete(a.id)}
                                disabled={deleteActivity.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-fade-in space-y-4">
            {reports.map((r) => (
              <div key={r.id} className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={r.status === 'pending' ? 'destructive' : 'secondary'}>{r.status}</Badge>
                    <Badge variant="outline">{r.type}</Badge>
                  </div>
                  <p className="font-medium text-sm">{r.activity}</p>
                  <p className="text-xs text-muted-foreground">Reported by {r.reporter}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success('Report resolved')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
