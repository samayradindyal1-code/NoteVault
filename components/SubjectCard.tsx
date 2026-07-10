import Link from "next/link";

interface SubjectCardProps {
  id: number;
  subjectName: string;
}

export default function SubjectCard({
  id,
  subjectName,
}: SubjectCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-xl font-semibold text-slate-900">
        📘 {subjectName}
      </h2>

      <Link
        href={`/notes/${id}`}
        className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
      >
        Open Notes
      </Link>
    </div>
  );
}