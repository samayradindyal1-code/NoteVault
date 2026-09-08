import Link from "next/link";

interface SemesterCardProps {
  id: number;
  name: string;
  status: string;
  route: string;
}

export default function SemesterCard({
  id,
  name,
  status,
  route,
}: SemesterCardProps) {
  const isAvailable = status === "available";
  const isUpcoming = status === "upcoming";

  return (
    <div
      className={`
        group rounded-2xl border bg-white p-6
        transition-all duration-200
        ${
          isAvailable
            ? "cursor-pointer border-slate-200 shadow-sm hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            : "border-slate-200 shadow-sm"
        }
      `}
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        {/* Book Icon */}
        <div
          className={`
            flex h-14 w-14 items-center justify-center
            rounded-2xl text-2xl
            ${
              isAvailable
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500"
            }
          `}
        >
          📚
        </div>

        {/* Status */}
        {isAvailable && (
          <span
            className="
              rounded-full border border-emerald-200
              bg-emerald-50 px-3 py-1.5
              text-xs font-semibold text-emerald-600
            "
          >
            ● Available
          </span>
        )}

        {!isAvailable && !isUpcoming && (
          <span
            className="
              rounded-full border border-slate-200
              bg-slate-50 px-3 py-1.5
              text-xs font-semibold text-slate-500
            "
          >
            🔒 Locked
          </span>
        )}

        {isUpcoming && (
          <span
            className="
              rounded-full border border-amber-200
              bg-amber-50 px-3 py-1.5
              text-xs font-semibold text-amber-600
            "
          >
            Coming Soon
          </span>
        )}
      </div>

      {/* Semester */}
      <div className="mt-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
          Semester {id}
        </p>

        <h2
          className={`
            mt-2 text-2xl font-bold
            ${
              isAvailable
                ? "text-slate-800 group-hover:text-indigo-600"
                : "text-slate-700"
            }
          `}
        >
          {name}
        </h2>
      </div>

      {/* Available */}
      {isAvailable && (
        <Link
          href={route}
          className="
            mt-8 flex w-full items-center justify-between
            rounded-xl bg-indigo-600
            px-5 py-3.5
            font-semibold text-white
            transition-all duration-200
            hover:bg-indigo-700
            active:scale-[0.98]
          "
        >
          <span>View Notes</span>
          <span className="text-lg">→</span>
        </Link>
      )}

      {/* Locked */}
      {!isAvailable && !isUpcoming && (
        <div
          className="
            mt-8 flex items-center justify-between
            rounded-xl border border-slate-200
            bg-slate-50 px-4 py-3.5
          "
        >
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span className="font-semibold text-slate-600">
              Semester Locked
            </span>
          </div>

          <span className="font-bold text-slate-700">
            ₹50
          </span>
        </div>
      )}

      {/* Coming Soon */}
      {isUpcoming && (
        <div
          className="
            mt-8 rounded-xl
            border border-amber-100
            bg-amber-50 px-4 py-3.5
            text-sm font-medium text-amber-700
          "
        >
          Notes will be available soon.
        </div>
      )}
    </div>
  );
}