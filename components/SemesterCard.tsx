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
        group relative overflow-hidden
        rounded-2xl border bg-white p-6
        transition-all duration-300 ease-out
        ${
          isAvailable
            ? "cursor-pointer border-slate-200 shadow-sm hover:-translate-y-2 hover:border-indigo-300 hover:shadow-xl"
            : "border-slate-200 shadow-sm"
        }
      `}
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div
          className={`
            flex h-14 w-14 items-center justify-center
            rounded-2xl text-2xl
            transition-all duration-300
            ${
              isAvailable
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md group-hover:scale-105"
                : "bg-slate-100"
            }
          `}
        >
          📚
        </div>

        {isAvailable && (
          <span
            className="
              inline-flex items-center gap-2
              rounded-full bg-emerald-50
              px-3 py-1.5
              text-xs font-semibold text-emerald-700
              ring-1 ring-inset ring-emerald-200
            "
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available
          </span>
        )}

        {!isAvailable && !isUpcoming && (
          <span
            className="
              inline-flex items-center gap-1.5
              rounded-full bg-slate-100
              px-3 py-1.5
              text-xs font-semibold text-slate-500
              ring-1 ring-inset ring-slate-200
            "
          >
            🔒 Locked
          </span>
        )}

        {isUpcoming && (
          <span
            className="
              rounded-full bg-amber-50
              px-3 py-1.5
              text-xs font-semibold text-amber-700
              ring-1 ring-inset ring-amber-200
            "
          >
            Coming Soon
          </span>
        )}
      </div>

      {/* Semester Name */}
      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          Semester {id}
        </p>

        <h2
          className={`
            mt-2 text-2xl font-bold
            ${
              isAvailable
                ? "text-slate-800 group-hover:text-indigo-700"
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
            rounded-xl
            bg-gradient-to-r from-indigo-600 to-violet-600
            px-5 py-3.5
            font-semibold text-white
            shadow-md
            transition-all duration-300
            hover:from-indigo-700
            hover:to-violet-700
            hover:shadow-lg
            active:scale-[0.98]
          "
        >
          <span>View Notes</span>

          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}

      {/* Locked */}
      {!isAvailable && !isUpcoming && (
        <div className="mt-8">
          <div
            className="
              flex items-center justify-between
              rounded-xl
              bg-slate-50
              px-4 py-3
              ring-1 ring-inset ring-slate-200
            "
          >
            <span className="text-sm font-semibold text-slate-600">
              🔒 Semester Locked
            </span>

            <span className="text-sm font-bold text-slate-800">
              ₹50
            </span>
          </div>

          <button
            type="button"
            disabled
            className="
              mt-4 w-full
              cursor-not-allowed
              rounded-xl
              border border-slate-200
              bg-slate-100
              px-5 py-3
              text-sm font-semibold
              text-slate-400
            "
          >
            Unlock Coming Soon
          </button>
        </div>
      )}

      {/* Upcoming */}
      {isUpcoming && (
        <div
          className="
            mt-8 rounded-xl
            bg-amber-50
            px-4 py-3
            text-sm font-medium text-amber-700
            ring-1 ring-inset ring-amber-200
          "
        >
          🚀 Notes Coming Soon
        </div>
      )}
    </div>
  );
}