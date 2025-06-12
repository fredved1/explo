import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const size = parseInt(searchParams.get('size') || '512')
  
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: size * 0.6,
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: size * 0.15,
        }}
      >
        🌳
      </div>
    ),
    {
      width: size,
      height: size,
    }
  )
}