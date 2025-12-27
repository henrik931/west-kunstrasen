'use client'

import { useEffect, useState } from 'react'
import { useParcelContext } from '@/lib/parcel-context'
import { formatEuro } from '@/lib/utils'
import { getParcelById, FIELD_CONFIG } from '@/lib/parcels'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart as CartIcon, Trash2, X, Check, Loader2 } from 'lucide-react'

interface ParcelGroup {
  type: string
  typeName: string
  count: number
  totalPrice: number
  ids: string[]
}

function groupSelectedParcels(ids: Set<string>): ParcelGroup[] {
  const groups: Record<string, ParcelGroup> = {}
  
  const typeNames: Record<string, string> = {
    goal: 'Tor-Parzelle',
    penalty: 'Elfmeterpunkt',
    kickoff: 'Anstoßpunkt',
    field: 'Feld-Parzelle',
  }

  for (const id of ids) {
    const parcel = getParcelById(id)
    if (!parcel) continue

    if (!groups[parcel.type]) {
      groups[parcel.type] = {
        type: parcel.type,
        typeName: typeNames[parcel.type] || parcel.type,
        count: 0,
        totalPrice: 0,
        ids: [],
      }
    }
    
    groups[parcel.type].count++
    groups[parcel.type].totalPrice += parcel.price
    groups[parcel.type].ids.push(id)
  }

  return Object.values(groups).sort((a, b) => b.totalPrice - a.totalPrice)
}

export function ShoppingCart() {
  const { selectedParcels, getTotal, clearSelection, deselectParcel, refreshStatuses } = useParcelContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckout, setIsCheckout] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successReservationId, setSuccessReservationId] = useState<string | null>(null)
  const [successDonorName, setSuccessDonorName] = useState<string | null>(null)
  const [successAnonymous, setSuccessAnonymous] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    donorName: '',
    anonymous: false,
    receiptRequested: false,
    address: '',
    city: '',
    zip: '',
  })

  const total = getTotal()
  const count = selectedParcels.size
  const groups = groupSelectedParcels(selectedParcels)
  const canRequestReceipt = total >= 300

  useEffect(() => {
    if (!canRequestReceipt && formData.receiptRequested) {
      setFormData(prev => ({ ...prev, receiptRequested: false }))
    }
  }, [canRequestReceipt, formData.receiptRequested])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcels: Array.from(selectedParcels),
          buyerName: formData.name,
          buyerEmail: formData.email,
          donorName: formData.donorName,
          anonymous: formData.anonymous,
          receiptRequested: formData.receiptRequested,
          buyerAddress: formData.receiptRequested ? formData.address : null,
          buyerCity: formData.receiptRequested ? formData.city : null,
          buyerZip: formData.receiptRequested ? formData.zip : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ein Fehler ist aufgetreten')
      }

      setIsSuccess(true)
      setSuccessReservationId(data.reservationId)
      setSuccessAnonymous(formData.anonymous)
      setSuccessDonorName(formData.anonymous ? null : formData.donorName.trim())
      clearSelection()
      setFormData({
        name: '',
        email: '',
        donorName: '',
        anonymous: false,
        receiptRequested: false,
        address: '',
        city: '',
        zip: '',
      })
      await refreshStatuses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetState = () => {
    setIsCheckout(false)
    setIsSuccess(false)
    setError(null)
    setSuccessReservationId(null)
    setSuccessDonorName(null)
    setSuccessAnonymous(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState() }}>
      <DialogTrigger
        render={
          <Button 
            className="fixed bottom-6 right-6 z-50 shadow-xl gap-2 bg-sc-yellow text-sc-navy hover:bg-sc-yellow/90 font-semibold"
            size="lg"
          />
        }
      >
        <CartIcon className="w-5 h-5" />
        {count > 0 && (
          <>
            <span>{count}</span>
            <Separator orientation="vertical" className="h-4 bg-sc-navy/20" />
            <span>{formatEuro(total)}</span>
          </>
        )}
        {count === 0 && <span>Warenkorb</span>}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Check className="w-6 h-6" />
                Reservierung erfolgreich!
              </DialogTitle>
              <DialogDescription>
                Vielen Dank für Ihre Spende. Sie erhalten in Kürze eine E-Mail mit den Zahlungsinformationen.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
              <div>
                <p className="font-medium">Zahlungsinformationen</p>
                <p>Empfänger: SC West Köln 1900/11 e.V.</p>
                <p>IBAN: DE46 3806 0185 4901 5910 62</p>
              </div>
              <div>
                <p className="font-medium">Verwendungszweck</p>
                <p>
                  Kunstrasen {successReservationId ?? '—'}
                  {" - "}
                  {successAnonymous || !successDonorName ? 'Anonym' : successDonorName}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Bitte unbedingt die Reservierungs-ID im Verwendungszweck angeben (Zuordnung).
              </p>
            </div>
            <DialogFooter>
              <DialogClose render={<Button />}>
                Schließen
              </DialogClose>
            </DialogFooter>
          </>
        ) : isCheckout ? (
          <>
            <DialogHeader>
              <DialogTitle>Spende abschließen</DialogTitle>
              <DialogDescription>
                Bitte geben Sie Ihre Kontaktdaten ein. Nach der Reservierung erhalten Sie eine E-Mail mit den Zahlungsinformationen.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Kontaktname *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Max Mustermann"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">E-Mail *</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="max@beispiel.de"
                />
              </div>

              <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.anonymous}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        anonymous: e.target.checked,
                        donorName: e.target.checked ? '' : prev.donorName,
                      }))
                    }
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-sc-yellow focus:ring-sc-yellow"
                  />
                  Anonym spenden
                </label>

                {!formData.anonymous && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name auf Spendertafel *</label>
                    <Input
                      required
                      value={formData.donorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, donorName: e.target.value }))}
                      placeholder="Familie Mustermann"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.receiptRequested}
                    disabled={!canRequestReceipt}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiptRequested: e.target.checked }))}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-sc-yellow focus:ring-sc-yellow disabled:opacity-50"
                  />
                  Spendenquittung (ab 300 €)
                </label>
                {!canRequestReceipt && (
                  <p className="text-xs text-white/50">
                    Eine Spendenquittung ist erst ab 300 € möglich.
                  </p>
                )}
              </div>

              {formData.receiptRequested && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Straße und Hausnummer *</label>
                    <Input
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Musterstraße 123"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">PLZ *</label>
                      <Input
                        required
                        value={formData.zip}
                        onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                        placeholder="50825"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Stadt *</label>
                      <Input
                        required
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Köln"
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between font-semibold">
                  <span>Gesamtbetrag:</span>
                  <span>{formatEuro(total)}</span>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCheckout(false)}>
                  Zurück
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-sc-yellow text-sc-navy hover:bg-sc-yellow/90">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    'Jetzt spenden'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CartIcon className="w-5 h-5" />
                Warenkorb
              </DialogTitle>
              <DialogDescription>
                {count === 0
                  ? 'Ihr Warenkorb ist leer. Klicken Sie auf das Spielfeld, um Parzellen auszuwählen.'
                  : `${count} Parzelle${count !== 1 ? 'n' : ''} ausgewählt`}
              </DialogDescription>
            </DialogHeader>

            {count > 0 && (
              <>
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div
                      key={group.type}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{group.count}x</Badge>
                        <div>
                          <p className="font-medium">{group.typeName}</p>
                          <p className="text-sm text-muted-foreground">
                            je {formatEuro(FIELD_CONFIG.PRICES[group.type as keyof typeof FIELD_CONFIG.PRICES])}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatEuro(group.totalPrice)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => group.ids.forEach(deselectParcel)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Gesamt:</span>
                  <span className="text-sc-yellow">{formatEuro(total)}</span>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={clearSelection}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Leeren
                  </Button>
                  <Button onClick={() => setIsCheckout(true)} className="bg-sc-yellow text-sc-navy hover:bg-sc-yellow/90">
                    Zur Kasse
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
