import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, PlusCircle, User, LayoutDashboard } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();

  const items = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/create', icon: PlusCircle, label: 'Create' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/admin', icon: LayoutDashboard, label: 'Admin' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${item.path === '/create' ? 'h-6 w-6' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
