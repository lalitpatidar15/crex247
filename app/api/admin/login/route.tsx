import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/Admin";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password, version } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 }
      );
    }

    const adminDoc = await Admin.findOne({ email, password });
    if (!adminDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid Email or Password" },
        { status: 401 }
      );
    }

    // ✅ Create response
    const res = NextResponse.json({
      success: true,
      adminId: String(adminDoc._id),
      role: adminDoc.role,
      versions: adminDoc.versions || [],
      message: "Login Successful",
    });

    // ✅ Set cookies (10 minutes session)
    res.cookies.set("admin-auth", String(adminDoc._id), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 10,
    });

    res.cookies.set("admin-role", adminDoc.role, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 10,
    });

    // ✅ Save admin email/name for client display
    res.cookies.set("admin-name", adminDoc.email, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 10,
    });

    // ✅ Store selected version constrained to admin's allowed versions
    const allowedVersions = Array.isArray(adminDoc.versions) ? adminDoc.versions : [];
    if (typeof version === "string" && allowedVersions.includes(version)) {
      res.cookies.set("admin-version", version, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 10,
      });
    }

    return res;

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
