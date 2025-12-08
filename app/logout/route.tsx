import { NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function POST() {
  const res = NextResponse.json({ success: true });

  // Clear all admin-related cookies
  res.cookies.set("admin-auth", "", { maxAge: 0, path: "/" });
  res.cookies.set("admin-role", "", { maxAge: 0, path: "/" });
  res.cookies.set("admin-name", "", { maxAge: 0, path: "/" });

  return res;
}


// export async function GET() {
//   const cookieStore = await cookies();
//   cookieStore.delete("admin-auth");

//   return NextResponse.redirect(new URL("/admin", ""));
// }