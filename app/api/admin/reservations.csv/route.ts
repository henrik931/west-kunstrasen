import { NextRequest, NextResponse } from 'next/server'
import { expireReservations, getReservationsFiltered, type ReservationFilters } from '@/lib/reservations'

export const runtime = "nodejs"

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const stringValue = value === null || value === undefined ? '' : String(value)
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

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

    const { searchParams } = new URL(request.url)
    const statusRaw = searchParams.get('status') || undefined
    const q = searchParams.get('q') || undefined
    const from = searchParams.get('from') || undefined
    const to = searchParams.get('to') || undefined

    const allowedStatuses = new Set(['pending', 'paid', 'expired', 'cancelled'])
    const status = statusRaw && allowedStatuses.has(statusRaw) ? statusRaw : undefined

    const filters: ReservationFilters = {
      status: status as ReservationFilters['status'],
      q,
      from,
      to,
    }

    const reservations = await getReservationsFiltered(filters)

    const header = [
      'reservationId',
      'status',
      'createdAt',
      'expiresAt',
      'paidAt',
      'buyerName',
      'buyerEmail',
      'donorName',
      'anonymous',
      'receiptRequested',
      'totalCents',
      'totalAmount',
      'parcels',
      'buyerAddress',
      'buyerZip',
      'buyerCity',
    ]

    const lines = [header.join(',')]

    for (const reservation of reservations) {
      const totalCents = Math.round(reservation.totalAmount * 100)
      const row = [
        reservation.id,
        reservation.status,
        reservation.createdAt,
        reservation.expiresAt,
        reservation.paidAt ?? '',
        reservation.buyerName,
        reservation.buyerEmail,
        reservation.donorName ?? '',
        reservation.anonymous,
        reservation.receiptRequested,
        totalCents,
        reservation.totalAmount,
        reservation.parcels.join('|'),
        reservation.buyerAddress ?? '',
        reservation.buyerZip ?? '',
        reservation.buyerCity ?? '',
      ].map(escapeCsvValue)

      lines.push(row.join(','))
    }

    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="reservations.csv"',
      },
    })
  } catch (error) {
    console.error('Failed to export reservations CSV:', error)
    return NextResponse.json(
      { error: 'Failed to export reservations' },
      { status: 500 }
    )
  }
}
