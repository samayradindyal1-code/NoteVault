export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Back button skeleton */}
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />

        {/* Heading skeleton */}
        <div className="mt-8">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-5 w-80 animate-pulse rounded bg-slate-200" />
        </div>

        {/* Notes skeleton */}
        <div className="mt-10 space-y-5">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />

              <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-slate-200" />

              <div className="mt-6 h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
            </div>
          ))}

        </div>

        {/* Loading text */}
        <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          Loading notes...
        </div>

      </div>
    </main>
  );
}