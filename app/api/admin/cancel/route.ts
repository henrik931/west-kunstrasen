import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cancelReservation, getReservation } from '@/lib/kv'

const cancelSchema = z.object({
  reservationId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const adminPassword = request.headers.get('x-admin-password')
  
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { reservationId } = cancelSchema.parse(body)

    const reservation = await getReservation(reservationId)
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservierung nicht gefunden' },
        { status: 404 }
      )
    }

    if (reservation.status !== 'pending') {
      return NextResponse.json(
        { error: `Reservierung kann nicht storniert werden (Status: ${reservation.status})` },
        { status: 400 }
      )
    }

    const success = await cancelReservation(reservationId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Stornieren der Reservierung' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reservierung erfolgreich storniert',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Cancel reservation error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

