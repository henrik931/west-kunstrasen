import { NextRequest, NextResponse } from 'next/server'
import { getAllReservations } from '@/lib/kv'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('x-admin-password')
  
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const reservations = await getAllReservations()
    
    return NextResponse.json({
      reservations: reservations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    })
  } catch (error) {
    console.error('Failed to fetch reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

