import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

// Debug environment variables
console.log("Environment variables check:")
console.log("KV_URL exists:", !!process.env.KV_URL)
console.log("REDIS_URL exists:", !!process.env.REDIS_URL)
console.log("KV_REST_API_TOKEN exists:", !!process.env.KV_REST_API_TOKEN)

let redis: Redis | null = null

try {
  const url = process.env.KV_URL || process.env.REDIS_URL
  const token = process.env.KV_REST_API_TOKEN
  
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