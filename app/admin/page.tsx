'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatEuro } from '@/lib/utils'
import { type ReservationDTO } from '@/lib/types'
import { Check, X, Loader2, Lock, RefreshCw, LogOut } from 'lucide-react'

const berlinDateTime = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatBerlinDateTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  return berlinDateTime.format(date)
}

type ReservationWithDetails = ReservationDTO

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([])
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isExpiring, setIsExpiring] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationDTO['status']>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }, [statusFilter, searchQuery, fromDate, toDate])

  const fetchReservations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/reservations${buildQueryParams()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        setIsAuthenticated(false)
        setError('Ungültiges Token')
        return
      }

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Reservierungen')
      }

      const data = await response.json()
      setReservations(data.reservations)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }, [token, buildQueryParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetchReservations()
  }

  useEffect(() => {
    if (isAuthenticated) {
      void fetchReservations()
    }
  }, [statusFilter, isAuthenticated, fetchReservations])

  const handleConfirm = async (reservationId: string) => {
    setActionLoading(reservationId)
    try {
      const response = await fetch('/api/admin/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reservationId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Bestätigen')
      }

      await fetchReservations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (reservationId: string) => {
    if (!confirm('Möchten Sie diese Reservierung wirklich stornieren?')) return

    setActionLoading(reservationId)
    try {
      const response = await fetch('/api/admin/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reservationId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Stornieren')
      }

      await fetchReservations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setToken('')
    setReservations([])
  }

  const handleExpire = async () => {
    setIsExpiring(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/expire', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Bereinigen')
      }

      await fetchReservations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsExpiring(false)
    }
  }

  const handleExportCsv = async () => {
    setIsExporting(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/reservations.csv${buildQueryParams()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim CSV-Export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'reservations.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: ReservationDTO['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Ausstehend</Badge>
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">Bezahlt</Badge>
      case 'expired':
        return <Badge variant="outline" className="bg-slate-500/20 text-slate-300 border-slate-400/30">Abgelaufen</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">Storniert</Badge>
    }
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending')
  const paidReservations = reservations.filter(r => r.status === 'paid')
  const expiredReservations = reservations.filter(r => r.status === 'expired')
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled')

  const totalPending = pendingReservations.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalPaid = paidReservations.reduce((sum, r) => sum + r.totalAmount, 0)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sc-navy text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sc-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-sc-navy" />
            </div>
            <h1 className="text-2xl font-bold">Admin-Bereich</h1>
            <p className="text-white/60 mt-2">SC West Köln - Kunstrasen Aktion</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Admin-Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-white/10 border-white/20"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !token}
              className="w-full bg-sc-yellow text-sc-navy hover:bg-sc-yellow/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird geladen...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sc-navy text-white">
      <header className="sticky top-0 z-40 bg-sc-navy/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Admin-Bereich</h1>
            <p className="text-xs text-white/60">SC West Köln - Kunstrasen Aktion</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchReservations}
              disabled={isLoading}
              className="border-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpire}
              disabled={isExpiring}
              className="border-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isExpiring ? 'animate-spin' : ''}`} />
              Abgelaufene bereinigen
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-white/60 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Suche nach Name, E-Mail, ID, Betrag"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/20"
            />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-white/10 border-white/20"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-white/10 border-white/20"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={fetchReservations}
                disabled={isLoading}
                className="border-white/20 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Lädt...
                  </>
                ) : (
                  'Filter anwenden'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="border-white/20 w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    CSV...
                  </>
                ) : (
                  'CSV Export'
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {(['all', 'pending', 'paid', 'expired', 'cancelled'] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status ? 'bg-sc-yellow text-sc-navy' : 'border-white/20'}
              >
                {status === 'all' && 'Alle'}
                {status === 'pending' && 'Ausstehend'}
                {status === 'paid' && 'Bezahlt'}
                {status === 'expired' && 'Abgelaufen'}
                {status === 'cancelled' && 'Storniert'}
              </Button>
            ))}
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Ausstehend</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingReservations.length}</p>
            <p className="text-sm text-white/40">{formatEuro(totalPending)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Bezahlt</p>
            <p className="text-2xl font-bold text-green-400">{paidReservations.length}</p>
            <p className="text-sm text-white/40">{formatEuro(totalPaid)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Storniert</p>
            <p className="text-2xl font-bold text-red-400">{cancelledReservations.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Abgelaufen</p>
            <p className="text-2xl font-bold text-slate-300">{expiredReservations.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Gesamt</p>
            <p className="text-2xl font-bold">{reservations.length}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Pending Reservations */}
        {pendingReservations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-400 rounded-full" />
              Ausstehende Reservierungen
            </h2>
            <div className="space-y-4">
              {pendingReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  isLoading={actionLoading === reservation.id}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </section>
        )}

        {/* Confirmed Reservations */}
        {paidReservations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full" />
              Bezahlte Reservierungen
            </h2>
            <div className="space-y-4">
              {paidReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </section>
        )}

        {expiredReservations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-300 rounded-full" />
              Abgelaufene Reservierungen
            </h2>
            <div className="space-y-4 opacity-70">
              {expiredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </section>
        )}

        {/* Cancelled Reservations */}
        {cancelledReservations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400 rounded-full" />
              Stornierte Reservierungen
            </h2>
            <div className="space-y-4 opacity-60">
              {cancelledReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </section>
        )}

        {reservations.length === 0 && !isLoading && (
          <div className="text-center py-12 text-white/40">
            <p>Keine Reservierungen vorhanden</p>
          </div>
        )}
      </main>
    </div>
  )
}

function ReservationCard({
  reservation,
  onConfirm,
  onCancel,
  isLoading,
  getStatusBadge,
}: {
  reservation: ReservationWithDetails
  onConfirm?: (id: string) => void
  onCancel?: (id: string) => void
  isLoading?: boolean
  getStatusBadge: (status: ReservationDTO['status']) => React.ReactNode
}) {
  const parcelCounts = reservation.parcels.reduce((acc, id) => {
    if (id.startsWith('goal-')) acc.goal++
    else if (id.startsWith('penalty-')) acc.penalty++
    else if (id === 'kickoff') acc.kickoff++
    else if (id.startsWith('field-')) acc.field++
    return acc
  }, { goal: 0, penalty: 0, kickoff: 0, field: 0 })

  const donorDisplay = reservation.anonymous
    ? 'Anonym'
    : (reservation.donorName?.trim() || reservation.buyerName)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-mono text-sm">{reservation.id}</h3>
            {getStatusBadge(reservation.status)}
          </div>
          <p className="font-semibold text-lg">{reservation.buyerName}</p>
          <p className="text-sm text-white/60">{reservation.buyerEmail}</p>
          <p className="text-sm text-white/60">Spender: {donorDisplay}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-sc-yellow">{formatEuro(reservation.totalAmount)}</p>
          <p className="text-sm text-white/40">
            {formatBerlinDateTime(reservation.createdAt)}
          </p>
        </div>
      </div>

      <Separator className="bg-white/10 my-4" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        {parcelCounts.goal > 0 && (
          <div>
            <span className="text-white/60">Tor-Parzellen:</span>
            <span className="ml-2 font-medium">{parcelCounts.goal}</span>
          </div>
        )}
        {parcelCounts.penalty > 0 && (
          <div>
            <span className="text-white/60">Elfmeterpunkte:</span>
            <span className="ml-2 font-medium">{parcelCounts.penalty}</span>
          </div>
        )}
        {parcelCounts.kickoff > 0 && (
          <div>
            <span className="text-white/60">Anstoßpunkt:</span>
            <span className="ml-2 font-medium">{parcelCounts.kickoff}</span>
          </div>
        )}
        {parcelCounts.field > 0 && (
          <div>
            <span className="text-white/60">Feld-Parzellen:</span>
            <span className="ml-2 font-medium">{parcelCounts.field}</span>
          </div>
        )}
      </div>

      <div className="text-sm text-white/60 mb-4">
        <p>{reservation.buyerAddress}</p>
        <p>{reservation.buyerZip} {reservation.buyerCity}</p>
      </div>

      {reservation.status === 'pending' && onConfirm && onCancel && (
        <div className="flex gap-3">
          <Button
            onClick={() => onConfirm(reservation.id)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Zahlung bestätigen
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onCancel(reservation.id)}
            disabled={isLoading}
            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            <X className="w-4 h-4 mr-2" />
            Stornieren
          </Button>
        </div>
      )}

      {reservation.status === 'paid' && reservation.paidAt && (
        <p className="text-sm text-green-400">
          Bezahlt am {formatBerlinDateTime(reservation.paidAt)}
        </p>
      )}
    </div>
  )
}
