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
    <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-300">
      <h2 className="text-xl font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-700">
        📘 {subjectName}
      </h2>

      <Link
        href={`/notes/${id}`}
        className="mt-5 inline-block cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-xl active:scale-95"
      >
        📖 Open Notes
      </Link>
    </div>
  );
}