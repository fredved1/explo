import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function GET() {
  try {
    const data = await redis.get("familieweekend-data")
    return NextResponse.json(data || { teams: {}, polls: {} })
  } catch (error) {
    console.error("Error fetching data from Redis:", error)
    // Fallback to empty data if Redis not configured yet
    return NextResponse.json({ teams: {}, polls: {} })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await redis.set("familieweekend-data", data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving data to Redis:", error)
    return NextResponse.json({ success: false, error: "Failed to save data" }, { status: 500 })
  }
}