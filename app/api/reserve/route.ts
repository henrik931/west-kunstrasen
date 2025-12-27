import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateTotal } from '@/lib/parcels'
import { sendReservationEmail } from '@/lib/mailjet'
import { generateReservationId } from '@/lib/utils'
import { createReservation, expireReservations } from '@/lib/reservations'

export const runtime = "nodejs"

const reserveSchema = z.object({
  parcels: z.array(z.string()).min(1, 'Bitte wählen Sie mindestens eine Parzelle aus'),
  buyerName: z.string().min(2, 'Bitte geben Sie Ihren Namen ein'),
  buyerEmail: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  buyerAddress: z.string().min(5, 'Bitte geben Sie Ihre Adresse ein'),
  buyerCity: z.string().min(2, 'Bitte geben Sie Ihre Stadt ein'),
  buyerZip: z.string().min(4, 'Bitte geben Sie Ihre PLZ ein'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = reserveSchema.parse(body)

    const totalAmount = calculateTotal(validatedData.parcels)
    const reservationInput = {
      id: generateReservationId(),
      parcels: validatedData.parcels,
      buyerName: validatedData.buyerName,
      buyerEmail: validatedData.buyerEmail,
      buyerAddress: validatedData.buyerAddress,
      buyerCity: validatedData.buyerCity,
      buyerZip: validatedData.buyerZip,
      totalAmount,
    }

    await expireReservations()
    const reservation = await createReservation(reservationInput)

    const emailSent = await sendReservationEmail(reservation)
    if (!emailSent) {
      console.error('Failed to send confirmation email for reservation:', reservation.id)
    }

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      totalAmount,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'PARCEL_NOT_AVAILABLE') {
      return NextResponse.json(
        { error: 'Einige der ausgewählten Parzellen sind nicht mehr verfügbar. Bitte aktualisieren Sie die Seite.' },
        { status: 409 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Reservation error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    )
  }
}
