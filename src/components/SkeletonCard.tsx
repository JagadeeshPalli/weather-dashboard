export function SkeletonHero() {
  return (
    <div className="glass-card animate-pulse">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-3 flex-1">
          <div className="h-4 w-32 rounded-md bg-skeleton" />
          <div className="h-20 w-44 rounded-md bg-skeleton" />
          <div className="h-4 w-28 rounded-md bg-skeleton" />
          <div className="h-4 w-52 rounded-md bg-skeleton" />
          <div className="h-3 w-36 rounded-md bg-skeleton opacity-60" />
        </div>
        <div className="w-28 h-28 rounded-full bg-skeleton" />
      </div>
    </div>
  )
}

export function SkeletonDetails() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card animate-pulse flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-16 rounded bg-skeleton" />
            <div className="w-4 h-4 rounded-sm bg-skeleton" />
          </div>
          <div className="h-6 w-20 rounded-md bg-skeleton" />
          <div className="h-1 rounded-full bg-skeleton opacity-60" />
        </div>
      ))}
    </div>
  )
}
