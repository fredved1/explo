import { NextResponse } from "next/server"

// Try to import Vercel KV, but handle gracefully if not available
let kv: any = null
try {
  const kvModule = await import("@vercel/kv")
  kv = kvModule.kv
} catch (error) {
  console.warn("Vercel KV not available:", error)
}

export async function GET() {
  try {
    if (kv) {
      const data = await kv.get("familieweekend-data")
      return NextResponse.json(data || { teams: {}, polls: {} })
    } else {
      // Return empty data if KV not available
      return NextResponse.json({ teams: {}, polls: {} })
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ teams: {}, polls: {} })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (kv) {
      await kv.set("familieweekend-data", data)
      return NextResponse.json({ success: true })
    } else {
      console.warn("Vercel KV not available, data not persisted to server")
      return NextResponse.json({ success: false, error: "KV not available" }, { status: 503 })
    }
  } catch (error) {
    console.error("Error saving data:", error)
    return NextResponse.json({ success: false, error: "Failed to save data" }, { status: 500 })
  }
}