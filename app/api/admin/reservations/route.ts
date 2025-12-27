import { NextRequest, NextResponse } from 'next/server'
import { expireReservations, getAllReservations } from '@/lib/reservations'

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    await expireReservations()
    const reservations = await getAllReservations()
    const statusOrder = {
      pending: 0,
      paid: 1,
      expired: 2,
      cancelled: 3,
    }
    
    return NextResponse.json({
      reservations: reservations.sort((a, b) => {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status]
        if (statusDiff !== 0) return statusDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }),
    })
  } catch (error) {
    console.error('Failed to fetch reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}
