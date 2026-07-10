"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage(){
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {

    const saveUser = async () => {
      const {
        data:{user},
      } = await supabase.auth.getUser();

      if(user){

        const {error} = await supabase
        .from("users")
        .upsert({
          id:user.id,
          name:user.user_metadata.full_name,
          email:user.email,
          photo:user.user_metadata.avatar_url,
          role:"student",

        });
        if(error){

          console.log(error);
        }
        else{
          console.log("User saved");

          // redirect after login

          router.push("/semester");

        }
      }
    };
    saveUser();

  }, [router]);

  const loginWithGoogle = async()=>{
    const {error}=await supabase.auth.signInWithOAuth({

      provider:"google",

      options:{
        redirectTo:"http://localhost:3000/login",

      },

    });

    if(error){

      console.log(error);

    }

  };

  return (

    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl text-center">

        <div className="mb-6">

          <h1 className="text-4xl font-bold text-blue-700">

            NoteVault

          </h1>

          <p className="mt-2 text-gray-500">

            Welcome back 👋

          </p>
        </div>

        <p className="mb-8 text-gray-600">

          Access your BTech CSE notes semester wise.

        </p>
        <button

        onClick={loginWithGoogle}

        className="flex w-full items-center justify-center gap-3 rounded-xl border px-5 py-3 text-lg font-medium shadow hover:bg-gray-50 transition"

        >
        <span className="text-xl">
          🌐
        </span>

        Continue with Google
        </button>
        <p className="mt-8 text-sm text-gray-400">

          Secure notes • Semester wise access • Affordable learning

        </p>
      </div>
    </main>
  );

}