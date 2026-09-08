export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Heading Skeleton */}
        <div className="mb-10">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
        </div>

        {/* Subject Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="
                rounded-2xl border border-slate-200
                bg-white p-6 shadow-sm
              "
            >
              <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />

              <div className="mt-6 h-11 w-32 animate-pulse rounded-xl bg-slate-200" />
            </div>
          ))}

        </div>

        {/* Loading Text */}
        <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-500">
          <div
            className="
              h-5 w-5 animate-spin rounded-full
              border-2 border-slate-200
              border-t-indigo-600
            "
          />

          Loading notes...
        </div>

      </div>
    </main>
  );
}