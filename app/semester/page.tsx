import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SemesterList(){

const supabase = await createClient();
const {data: semesters}= await supabase
.from("semesters")
.select("*")
.order("id");
return(

<div className="p-10">
<h1 className="text-3xl font-bold mb-8">
Select Semester
</h1>

<div className="grid md:grid-cols-4 gap-6">

{
semesters?.map((semester)=>(

<Link
href={`/semester/${semester.id}`}
key={semester.id}
>

<div className="border rounded-xl p-6 shadow hover:scale-105 transition">

<h2 className="text-xl font-bold">
{semester.name}
</h2>


<p className="mt-3 text-sm font-semibold">

{
semester.status === "available" 
?
"✅ Available"
:
semester.status === "upcoming"
?
"🔜 Coming Soon"
:
"🔒 Unavailable"
}

</p>

</div>
</Link>
))
}
</div>

</div>
)
}