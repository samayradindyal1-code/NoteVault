import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SemesterPage({
  params,
}: {
  params: Promise<{ semesterId: string }>;
}) {

  const { semesterId } = await params;

  const supabase = await createClient();

  const id = Number(semesterId);


  // Get semester details
const { data: semester } = await supabase
.from("semesters")
.select("*")
.eq("id", id)
.single();


// Check semester status

if(semester?.status === "unavailable")
{
return(
<div className="p-10 text-center">

<h1 className="text-3xl font-bold">
{semester.name}
</h1>

<p className="mt-5 text-xl">
🔒 Notes not available yet
</p>

</div>
)
}

if(semester?.status === "upcoming")
{
return(
<div className="p-10 text-center">

<h1 className="text-3xl font-bold">
{semester.name}
</h1>

<p className="mt-5 text-xl">
🔜 Notes Coming Soon
</p>

</div>
)
}

// Get subjects of this semester
const { data: subjects } = await supabase
.from("subjects")
.select("*")
.eq("semester_id", id)
.order("id");



  if (!semester) {
    return (
      <div className="p-10 text-center">
        Semester not found
      </div>
    );
  }



  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        {semester.name}
      </h1>


      <div className="grid md:grid-cols-3 gap-6">


        {subjects?.map((subject)=>(
          
          <div
          key={subject.id}
          className="border rounded-xl p-5 shadow"
          >


            <h2 className="text-xl font-semibold">
              {subject.subject_name}
            </h2>


            <Link
            href={`/notes/${subject.id}`}
            className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Open Notes
            </Link>


          </div>

        ))}


      </div>


    </div>

  );
}