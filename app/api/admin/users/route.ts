import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/Admin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();
    const store = await cookies();
    const role = store.get("admin-role")?.value;
    if (role !== "superadmin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const admins = await Admin.find();
    return NextResponse.json({ success: true, data: admins });
  } catch (err) {
    console.error("/api/admin/users GET error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const store = await cookies();
    const role = store.get("admin-role")?.value;
    // Bootstrap: if there are no admins yet, allow creating the first one
    const adminCount = await Admin.countDocuments();
    const isBootstrap = adminCount === 0;
    if (!isBootstrap && role !== "superadmin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { email, password, role: adminRole = "admin", versions = [] } = body;
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "email and password required" }, { status: 400 });
    }
    // Make sure indexes are in sync to apply unique constraints correctly
    await Admin.syncIndexes();
    const created = await Admin.create({ email, password, role: adminRole, versions });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("/api/admin/users POST error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const store = await cookies();
    const role = store.get("admin-role")?.value;
    if (role !== "superadmin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    }
    await Admin.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/admin/users DELETE error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
