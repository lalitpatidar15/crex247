import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { RollV1, RollV2, RollV3, RollV4 } from "@/app/models/Roll";
import { connectDB } from "@/app/lib/db";

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const role = cookieStore.get("admin-role")?.value;

  if (!role) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const rolls = await RollV1.find({ adminRole: role }).sort({ createdAt: -1 }); // or RollV2, RollV3, RollV4 as needed

  return NextResponse.json({ success: true, data: rolls });
}
