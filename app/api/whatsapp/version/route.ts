import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/app/lib/db";
import {
  WhatsappV1,
  WhatsappV2,
  WhatsappV3,
  WhatsappV4,
} from "@/app/models/Whatsapp";

const modelMap: any = {
  v1: WhatsappV1,
  v2: WhatsappV2,
  v3: WhatsappV3,
  v4: WhatsappV4,
};

// GET (Fetch WhatsApp numbers)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const version = url.searchParams.get("version") || "v1";
    const Model = modelMap[version];

    if (!Model)
      return NextResponse.json({ error: "Invalid version" }, { status: 400 });

    const data = await Model.findOne();

    return NextResponse.json(
      data || {
        newCustomer: "",
        deposit: "",
        withdrawal: "",
        support: "",
        number: "",
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — Create or Update WhatsApp numbers
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const auth = cookieStore.get("admin-auth")?.value;
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const url = new URL(req.url);
    const version = url.searchParams.get("version") || "v1";
    const Model = modelMap[version];

    if (!Model)
      return NextResponse.json({ error: "Invalid version" }, { status: 400 });

    const body = await req.json();

    if (!body.number)
      return NextResponse.json({ error: "Number required" }, { status: 400 });

    const saved = await Model.findOneAndUpdate({}, body, {
      upsert: true,
      new: true,
    });

    return NextResponse.json({ success: true, data: saved }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false, error: "Save failed" }, { status: 500 });
  }
}
