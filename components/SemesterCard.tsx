import Link from "next/link";

interface SemesterCardProps {
  id: number;
  name: string;
  status: string;
  route: string;
}

export default function SemesterCard({
  name,
  status,
  route,
}: SemesterCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-slate-900">
        {name}
      </h2>

      <p className="mt-2 text-slate-600">
        Computer Science Engineering Notes
      </p>

      <div className="mt-6">
        {status === "available" && (
          <Link
            href={route}
            className="inline-block rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
          >
            Explore →
          </Link>
        )}

        {status === "upcoming" && (
          <span className="inline-block rounded-lg bg-yellow-100 px-4 py-2 font-medium text-yellow-700">
            🚀 Coming Soon
          </span>
        )}

        {status === "unavailable" && (
          <span className="inline-block rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-600">
            🔒 Unavailable
          </span>
        )}
      </div>
    </div>
  );
}