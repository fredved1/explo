import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await kv.get("familieweekend-data")
    return NextResponse.json(data || { teams: {}, polls: {} })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ teams: {}, polls: {} })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await kv.set("familieweekend-data", data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving data:", error)
    return NextResponse.json({ success: false, error: "Failed to save data" }, { status: 500 })
  }
}