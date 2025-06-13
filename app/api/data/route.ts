import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

// Create Redis client with correct URL and token
const redis = new Redis({
  url: "https://uncommon-dodo-42847.upstash.io",
  token: "AadfAAIjcDE2NGMwNTZhYWYzZjY0ZmQ4OWQzYmVhMDY3MDkwNDUxM3AxMA"
})

export async function GET() {
  try {
    console.log("GET: Fetching data from Redis...")
    const data = await redis.get("familieweekend-data")
    console.log("GET: Data retrieved:", data)
    return NextResponse.json(data || { teams: {}, polls: {} })
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ teams: {}, polls: {} })
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST: Starting save to Redis...")
    const data = await request.json()
    console.log("POST: Data to save:", data)
    
    const result = await redis.set("familieweekend-data", data)
    console.log("POST: Redis set result:", result)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to save data",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}