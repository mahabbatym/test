export default function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-5" role="status" aria-label="Loading">
        <div className="cherry-skeleton h-10 w-44 rounded-lg" />
        <div className="cherry-skeleton h-12 w-3/4 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="cherry-skeleton h-36 rounded-lg" />
          <div className="cherry-skeleton h-36 rounded-lg" />
          <div className="cherry-skeleton h-36 rounded-lg" />
        </div>
        <div className="cherry-skeleton h-56 rounded-lg" />
      </div>
    </div>
  );
}
