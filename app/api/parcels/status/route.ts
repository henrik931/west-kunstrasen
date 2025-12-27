import { NextResponse } from 'next/server'
import { getSoldAndReservedParcels } from '@/lib/reservations'

export const runtime = "nodejs"

export async function GET() {
  try {
    const { sold, reserved } = await getSoldAndReservedParcels()

    return NextResponse.json(
      {
        sold,
        reserved,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=5, s-maxage=5, stale-while-revalidate=5',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch parcel status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parcel status' },
      { status: 500 }
    )
  }
}
