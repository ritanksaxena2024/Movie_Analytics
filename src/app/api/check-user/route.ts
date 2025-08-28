import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Fetch user by email
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If data is null, user does not exist
    return NextResponse.json({ exists: !!data });
  } catch  {

    return NextResponse.json("Something went wrong" , { status: 500 });
  }
}
