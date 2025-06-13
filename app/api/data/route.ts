import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

let redis: Redis | null = null

try {
  // Use the Redis credentials from Upstash dashboard
  const url = "https://upstash-redis-aadfaaijcde2ngmwntzhawyzzjy0zmq4owqzymvhmdy3mdkwndezmxaxma.upstash.io"
  const token = "AadfAAIjcDE2NGMwNTZhYWYzZjY0ZmQ4OWQzYmVhMDY3MDkwNDUxM3AxMA"
  
  if (url && token) {
    redis = new Redis({ url, token })
    console.log("Redis client created successfully")
  } else {
    console.error("Missing Redis credentials:", { url: !!url, token: !!token })
  }
} catch (error) {
  console.error("Error creating Redis client:", error)
}

export async function GET() {
  try {
    if (!redis) {
      console.log("Redis not available, returning empty data")
      return NextResponse.json({ teams: {}, polls: {} })
    }
    
    const data = await redis.get("familieweekend-data")
    return NextResponse.json(data || { teams: {}, polls: {} })
  } catch (error) {
    console.error("Error fetching data from Redis:", error)
    return NextResponse.json({ teams: {}, polls: {} })
  }
}

export async function POST(request: Request) {
  try {
    if (!redis) {
      console.error("Redis not available for saving")
      return NextResponse.json({ success: false, error: "Redis not configured" }, { status: 503 })
    }
    
    const data = await request.json()
    await redis.set("familieweekend-data", data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving data to Redis:", error)
    return NextResponse.json({ success: false, error: "Failed to save data" }, { status: 500 })
  }
}