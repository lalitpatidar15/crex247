import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/app/lib/db";
import { Whatsapp } from "@/app/models/Whatsapp";

// GET (Fetch WhatsApp numbers)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const version = url.searchParams.get("version") || "v1";
    const data = await Whatsapp.findOne({ version });

    return NextResponse.json(
      data || {
        newCustomer: "",
        deposit: "",
        withdrawal: "",
        support: "",
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

    const body = await req.json();

    // No longer require `number` field; accept partial updates

    const saved = await Whatsapp.findOneAndUpdate(
      { version },
      { ...body, version },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json({ success: true, data: saved }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false, error: "Save failed" }, { status: 500 });
  }
}
