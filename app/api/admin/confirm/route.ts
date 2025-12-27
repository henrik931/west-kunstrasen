import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { confirmReservation, getReservation } from '@/lib/kv'

const confirmSchema = z.object({
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
    const { reservationId } = confirmSchema.parse(body)

    const reservation = await getReservation(reservationId)
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservierung nicht gefunden' },
        { status: 404 }
      )
    }

    if (reservation.status !== 'pending') {
      return NextResponse.json(
        { error: `Reservierung kann nicht bestätigt werden (Status: ${reservation.status})` },
        { status: 400 }
      )
    }

    const success = await confirmReservation(reservationId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Bestätigen der Reservierung' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reservierung erfolgreich bestätigt',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Confirm reservation error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

