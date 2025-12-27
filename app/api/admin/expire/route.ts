import { NextRequest, NextResponse } from 'next/server'
import { expireReservations } from '@/lib/reservations'

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const expiredCount = await expireReservations()

    return NextResponse.json({
      success: true,
      expiredCount,
    })
  } catch (error) {
    console.error('Expire reservations error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
