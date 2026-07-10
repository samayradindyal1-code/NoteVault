const notes = [
  "Complete notes of all units",
  "Important Questions.pdf",
];

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <h1 className="text-center text-4xl font-bold text-blue-700">
        Database Management System
      </h1>

      <p className="mt-2 text-center text-gray-500">
        Semester 4
      </p>

      <div className="mx-auto mt-10 max-w-3xl space-y-5">

        {notes.map((note) => (

          <div
            key={note}
            className="flex items-center justify-between rounded-xl bg-white p-5 shadow-md"
          >

            <div>

              <h2 className="text-lg font-semibold">
                📄 {note}
              </h2>

              <p className="text-gray-500 text-sm">
                PDF Notes
              </p>

            </div>

            <button className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">

              Open

            </button>

          </div>

        ))}

      </div>

    </main>
  );
}