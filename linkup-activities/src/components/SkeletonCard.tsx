const SkeletonCard = () => (
  <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-muted" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-muted rounded w-3/4" />
      <div className="flex gap-3">
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-4 bg-muted rounded w-12" />
        <div className="h-4 bg-muted rounded w-20" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 bg-muted rounded w-12" />
        <div className="h-8 bg-muted rounded w-16" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
