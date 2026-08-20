import Skeleton from './ui/Skeleton';

export default function ProductCarouselSkeleton({ title, count = 4 }: { title?: string; count?: number }) {
  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0" style={{ width: '200px' }}>
            <Skeleton className="w-full h-48 mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
