function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`cherry-skeleton rounded-lg ${className ?? ""}`} />;
}

export default function LeaderboardLoading() {
  return (
    <main className="bg-background min-h-screen">
      <div className="border-border border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <SkeletonBlock className="h-9 w-32" />
          <SkeletonBlock className="h-8 w-28" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-10 w-64" />
            <SkeletonBlock className="h-5 w-80 max-w-full" />
          </div>
          <SkeletonBlock className="h-12 w-full sm:w-64" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {["first", "second", "third"].map((item) => (
            <SkeletonBlock key={item} className="h-44" />
          ))}
        </div>

        <div className="border-border bg-card mt-6 rounded-lg border p-4">
          <SkeletonBlock className="h-6 w-32" />
          <div className="mt-5 space-y-3">
            {["one", "two", "three", "four", "five"].map((item) => (
              <SkeletonBlock key={item} className="h-14" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
