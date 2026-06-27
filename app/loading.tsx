export default function Loading() {
  return (
    <main className="container-jstore section-space">
      <div className="space-y-5">
        <div className="card-jstore animate-pulse p-8">
          <div className="h-7 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-3 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="h-36 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-36 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-36 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    </main>
  );
}
