import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { Whatsapp } from "@/app/models/Whatsapp";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const version = searchParams.get("version");
    if (!version) {
      return NextResponse.json({ message: "version required" }, { status: 400 });
    }
    const data = await Whatsapp.findOne({ version });
    if (!data) {
      return NextResponse.json(
        { newCustomer: "", deposit: "", withdrawal: "", support: "" },
        { status: 200 }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch WhatsApp numbers", err);
    return NextResponse.json(
      { message: "Failed to fetch WhatsApp numbers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    // Only admins can update version site data
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const role = store.get("admin-role")?.value;
    if (!role || (role !== "admin" && role !== "superadmin")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { version, ...updateData } = body;
    if (!version) {
      return NextResponse.json({ message: "version required" }, { status: 400 });
    }
    await Whatsapp.findOneAndUpdate({ version }, updateData, { upsert: true, new: true });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to save WhatsApp numbers", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
