import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, Plus, Users, Crown, CalendarClock, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useNotifications';
import { Notification } from '@/lib/types';

const getNotifIcon = (type: Notification['type']) => {
  switch (type) {
    case 'participant_joined': return <Users className="h-4 w-4 text-primary" />;
    case 'activity_created':  return <Crown className="h-4 w-4 text-success" />;
    case 'activity_reminder': return <CalendarClock className="h-4 w-4 text-warning" />;
    default:                  return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const { data: notifications = [] } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const unreadCount = (notifications as Notification[]).filter((n) => !n.is_read).length;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/explore', label: 'Explore' },
    { path: '/create', label: 'Create' },
    { path: '/profile', label: 'Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleNotifClick = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.activity_id) {
      setNotifOpen(false);
      navigate(`/activity/${n.activity_id}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">LinkUp</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                  <Input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search activities..."
                    className="h-8 w-48 rounded-lg text-sm"
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-8 w-8">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Notifications */}
            {user && (
              <div className="relative" ref={notifRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground"
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl animate-fade-in overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead.mutate()}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-border max-h-72 overflow-y-auto">
                      {(notifications as Notification[]).length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No notifications yet</p>
                        </div>
                      ) : (
                        (notifications as Notification[]).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground leading-snug">{n.title}</p>
                              <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                            </div>
                            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link to="/create">
              <Button size="sm" className="gradient-bg text-primary-foreground btn-glow gap-1 border-0">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center ring-2 ring-border hover:ring-primary transition-all cursor-pointer">
                    <span className="text-primary-foreground font-bold text-xs">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { logout(); navigate('/'); }}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline" className="gap-1">
                  <LogIn className="h-4 w-4" /> Sign in
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities..."
                  className="pl-9 h-9 rounded-xl"
                />
              </div>
              <Button type="submit" size="sm" className="gradient-bg text-primary-foreground border-0">Go</Button>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
