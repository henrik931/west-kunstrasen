import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateTotal } from '@/lib/parcels'
import { sendReservationEmail } from '@/lib/mailjet'
import { generateReservationId } from '@/lib/utils'
import { createReservation, expireReservations } from '@/lib/reservations'
import type { ReserveRequest, ReserveResponse } from '@/lib/types'

export const runtime = "nodejs"

const reserveSchema = z.object({
  parcels: z.array(z.string()).min(1, 'Bitte wählen Sie mindestens eine Parzelle aus'),
  buyerName: z.string().min(2, 'Bitte geben Sie Ihren Namen ein'),
  buyerEmail: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  donorName: z.string().optional().nullable(),
  anonymous: z.boolean(),
  receiptRequested: z.boolean(),
  buyerAddress: z.string().optional().nullable(),
  buyerCity: z.string().optional().nullable(),
  buyerZip: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (!data.anonymous && (!data.donorName || data.donorName.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['donorName'],
      message: 'Bitte geben Sie den Namen für die Spendertafel an',
    })
  }

  if (data.receiptRequested) {
    if (!data.buyerAddress || data.buyerAddress.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['buyerAddress'],
        message: 'Bitte geben Sie Ihre Adresse ein',
      })
    }
    if (!data.buyerCity || data.buyerCity.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['buyerCity'],
        message: 'Bitte geben Sie Ihre Stadt ein',
      })
    }
    if (!data.buyerZip || data.buyerZip.trim().length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['buyerZip'],
        message: 'Bitte geben Sie Ihre PLZ ein',
      })
    }
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = reserveSchema.parse(body) as ReserveRequest

    const totalAmount = calculateTotal(validatedData.parcels)
    if (validatedData.receiptRequested && totalAmount < 300) {
      return NextResponse.json(
        { error: 'Eine Spendenquittung ist erst ab 300 € möglich.' },
        { status: 400 }
      )
    }
    const reservationInput = {
      id: generateReservationId(),
      parcels: validatedData.parcels,
      buyerName: validatedData.buyerName,
      buyerEmail: validatedData.buyerEmail,
      donorName: validatedData.donorName ?? null,
      anonymous: validatedData.anonymous,
      receiptRequested: validatedData.receiptRequested,
      buyerAddress: validatedData.buyerAddress ?? undefined,
      buyerCity: validatedData.buyerCity ?? undefined,
      buyerZip: validatedData.buyerZip ?? undefined,
      totalAmount,
    }

    await expireReservations()
    const reservation = await createReservation(reservationInput)

    const emailSent = await sendReservationEmail(reservation)
    if (!emailSent) {
      console.error('Failed to send confirmation email for reservation:', reservation.id)
    }

    const response: ReserveResponse = {
      success: true,
      reservationId: reservation.id,
      totalAmount,
    }

    return NextResponse.json(response)
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
