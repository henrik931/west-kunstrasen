import { NextResponse } from 'next/server'
import { getSoldAndReservedParcels } from '@/lib/kv'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { sold, reserved } = await getSoldAndReservedParcels()

    return NextResponse.json({
      sold,
      reserved,
    })
  } catch (error) {
    console.error('Failed to fetch parcel status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parcel status' },
      { status: 500 }
    )
  }
}

