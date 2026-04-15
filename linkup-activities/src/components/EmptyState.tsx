import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
      <SearchX className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
    {action && (
      <Button onClick={action.onClick} className="gradient-bg text-primary-foreground border-0">
        {action.label}
      </Button>
    )}
  </div>
);

export default EmptyState;
