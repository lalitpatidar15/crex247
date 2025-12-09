import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { RollV1, RollV2, RollV3, RollV4 } from "@/app/models/Roll";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const version = searchParams.get("version");
    let Model;
    if (version === "v1") Model = RollV1;
    else if (version === "v2") Model = RollV2;
    else if (version === "v3") Model = RollV3;
    else if (version === "v4") Model = RollV4;
    else return NextResponse.json({ data: [] }, { status: 400 });
    const rolls = await Model.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: rolls }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { version } = body;
    let Model;
    if (version === "v1") Model = RollV1;
    else if (version === "v2") Model = RollV2;
    else if (version === "v3") Model = RollV3;
    else if (version === "v4") Model = RollV4;
    else return NextResponse.json({ success: false, message: "version required" }, { status: 400 });

    if (body.action === "claim") {
      // Only authenticated admins can mark claims
      const { cookies } = await import("next/headers");
      const store = await cookies();
      const role = store.get("admin-role")?.value;
      if (!role || (role !== "admin" && role !== "superadmin")) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
      }
      const { id } = body;
      await Model.findByIdAndUpdate(id, { claimed: true });
      return NextResponse.json(
        { success: true, message: "Reward claimed successfully" },
        { status: 200 }
      );
    }

    const { number, reward, code, instantId } = body;
    const roll = await Model.create({
      number,
      reward,
      code,
      instantId,
      version,
      claimed: false,
    });
    return NextResponse.json({ roll }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    // Only superadmin can delete rolls
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const role = store.get("admin-role")?.value;
    if (role !== "superadmin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const version = searchParams.get("version");
    let Model;
    if (version === "v1") Model = RollV1;
    else if (version === "v2") Model = RollV2;
    else if (version === "v3") Model = RollV3;
    else if (version === "v4") Model = RollV4;
    else return NextResponse.json({ success: false, message: "version required" }, { status: 400 });
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    await Model.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
