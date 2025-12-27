import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  areParcelsAvailable, 
  createReservation, 
  calculateTotal,
  type Reservation 
} from '@/lib/kv'
import { sendReservationEmail } from '@/lib/mailjet'
import { generateReservationId } from '@/lib/utils'

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

    const available = await areParcelsAvailable(validatedData.parcels)
    if (!available) {
      return NextResponse.json(
        { error: 'Einige der ausgewählten Parzellen sind nicht mehr verfügbar. Bitte aktualisieren Sie die Seite.' },
        { status: 409 }
      )
    }

    const totalAmount = calculateTotal(validatedData.parcels)
    const reservation: Reservation = {
      id: generateReservationId(),
      parcels: validatedData.parcels,
      buyerName: validatedData.buyerName,
      buyerEmail: validatedData.buyerEmail,
      buyerAddress: validatedData.buyerAddress,
      buyerCity: validatedData.buyerCity,
      buyerZip: validatedData.buyerZip,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    await createReservation(reservation)

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

