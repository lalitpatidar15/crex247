import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/app/lib/db";
import DiceReward from "@/app/models/DiceReward";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const auth = cookieStore.get("admin-auth")?.value;
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    await DiceReward.syncIndexes();
    const body = await req.json();
    const { version, rewards } = body;
    if (!version) return NextResponse.json({ message: "version required" }, { status: 400 });
    if (!Array.isArray(rewards)) return NextResponse.json({ message: "rewards array required" }, { status: 400 });
    // Use single DiceReward model scoped by version

    for (const item of rewards) {
      const diceNumber = item.diceNumber;
      const percent = Number(item.percent) || 0;
      await DiceReward.findOneAndUpdate(
        { diceNumber, version },
        { percent, version },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ message: "Reward Percentage Updated Successfully ✅" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Update Failed ❌" }, { status: 500 });
  }
}
