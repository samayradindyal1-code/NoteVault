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
        rounded-2xl border
        bg-white
        p-6
        transition-all duration-300 ease-out

        ${
          isAvailable
            ? "cursor-pointer border-slate-200 shadow-sm hover:-translate-y-2 hover:border-indigo-300 hover:shadow-2xl"
            : "border-slate-200 shadow-sm"
        }
      `}
    >
      {/* Top Section */}
      <div className="flex items-start justify-between">
        {/* Semester Icon */}
        <div
          className={`
            flex h-14 w-14 items-center justify-center
            rounded-2xl text-2xl
            transition-all duration-300
            ${
              isAvailable
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md group-hover:scale-110"
                : "bg-slate-100 text-slate-400"
            }
          `}
        >
          📚
        </div>

        {/* Status Badge */}
        {isAvailable && (
          <span
            className="
              inline-flex items-center gap-1.5
              rounded-full
              bg-emerald-50
              px-3 py-1.5
              text-xs font-semibold
              text-emerald-700
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
              rounded-full
              bg-slate-100
              px-3 py-1.5
              text-xs font-semibold
              text-slate-500
              ring-1 ring-inset ring-slate-200
            "
          >
            🔒 Locked
          </span>
        )}

        {isUpcoming && (
          <span
            className="
              inline-flex items-center
              rounded-full
              bg-amber-50
              px-3 py-1.5
              text-xs font-semibold
              text-amber-700
              ring-1 ring-inset ring-amber-200
            "
          >
            Coming Soon
          </span>
        )}
      </div>

      {/* Semester Name */}
      <div className="mt-6">
        <p className="text-sm font-medium text-slate-400">
          SEMESTER {id}
        </p>

        <h2
          className={`
            mt-1 text-2xl font-bold
            transition-colors duration-300
            ${
              isAvailable
                ? "text-slate-800 group-hover:text-indigo-700"
                : "text-slate-600"
            }
          `}
        >
          {name}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Computer Science Engineering notes and study material.
        </p>
      </div>

      {/* Available Semester */}
      {isAvailable && (
        <>
          {/* Price + Access */}
          <div
            className="
              mt-5
              flex items-center justify-between
              rounded-xl
              bg-slate-50
              px-4 py-3
              transition-colors duration-300
              group-hover:bg-indigo-50
            "
          >
            <div>
              <p className="text-xs text-slate-500">
                Semester Access
              </p>

              <p className="mt-0.5 text-lg font-bold text-slate-800">
                ₹50
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">
                Validity
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                3 Months
              </p>
            </div>
          </div>

          {/* Action */}
          <Link
            href={route}
            className="
              mt-5 flex w-full
              items-center justify-between
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

            <span
              className="
                text-lg
                transition-transform duration-300
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </Link>
        </>
      )}

      {/* Locked Semester */}
      {!isAvailable && !isUpcoming && (
        <div className="mt-6">
          <div
            className="
              rounded-xl
              bg-slate-50
              p-4
              ring-1 ring-inset ring-slate-200
            "
          >
            <p className="text-sm font-semibold text-slate-700">
              🔒 Semester Locked
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Unlock this semester to access all notes and study
              materials.
            </p>
          </div>

          <div
            className="
              mt-4 flex items-center justify-between
              text-sm
            "
          >
            <span className="font-semibold text-slate-700">
              ₹50
            </span>

            <span className="text-slate-400">
              3 months access
            </span>
          </div>
        </div>
      )}

      {/* Coming Soon */}
      {isUpcoming && (
        <div className="mt-6">
          <div
            className="
              rounded-xl
              bg-amber-50
              p-4
              ring-1 ring-inset ring-amber-200
            "
          >
            <p className="text-sm font-semibold text-amber-800">
              🚀 Notes Coming Soon
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Notes for this semester will be available soon.
            </p>
          </div>
        </div>
      )}

      {/* Hover Decoration */}
      {isAvailable && (
        <div
          className="
            pointer-events-none absolute
            -right-10 -top-10
            h-28 w-28
            rounded-full
            bg-indigo-100/40
            opacity-0
            blur-2xl
            transition-opacity duration-300
            group-hover:opacity-100
          "
        />
      )}
    </div>
  );
}