import { useState } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  useAppointmentTypes,
  useAvailabilityDates,
  useAvailabilityTimes,
  useCreateBooking,
} from '../api/useAcuity'

interface Props {
  open: boolean
  onClose: () => void
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NewBookingForm({ open, onClose }: Props) {
  const [typeId, setTypeId] = useState<number | null>(null)
  const [month, setMonth] = useState(currentMonth())
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const { data: types, isLoading: typesLoading } = useAppointmentTypes(open)
  const { data: dates, isLoading: datesLoading } = useAvailabilityDates(
    typeId,
    month
  )
  const { data: times, isLoading: timesLoading } = useAvailabilityTimes(
    typeId,
    date
  )
  const create = useCreateBooking()

  function reset() {
    setTypeId(null)
    setMonth(currentMonth())
    setDate(null)
    setTime(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
  }

  function close() {
    reset()
    onClose()
  }

  const canSubmit =
    typeId != null && time != null && firstName.trim() && lastName.trim()

  async function submit() {
    if (!canSubmit || typeId == null || time == null) return
    try {
      await create.mutateAsync({
        appointmentTypeID: typeId,
        datetime: time,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      })
      toast.success('Booking created')
      close()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && close()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-6">
          <SheetTitle>New booking</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5">
          {/* Step 1: appointment type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="booking-type">Activity type</Label>
            <select
              id="booking-type"
              value={typeId ?? ''}
              disabled={typesLoading}
              onChange={(e) => {
                setTypeId(e.target.value ? Number(e.target.value) : null)
                setDate(null)
                setTime(null)
              }}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">
                {typesLoading ? 'Loading…' : 'Select activity type…'}
              </option>
              {types?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.duration ? ` · ${t.duration} min` : ''}
                  {t.price && t.price !== '0' ? ` · ${t.price}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: month + date */}
          {typeId != null && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="booking-month">Available dates</Label>
              <input
                id="booking-month"
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value)
                  setDate(null)
                  setTime(null)
                }}
                className="h-9 w-44 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {datesLoading ? (
                <p className="text-xs text-muted-foreground">Loading dates…</p>
              ) : dates && dates.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {dates.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => {
                        setDate(d.date)
                        setTime(null)
                      }}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        date === d.date
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:bg-muted'
                      )}
                    >
                      {new Date(`${d.date}T00:00:00`).toLocaleDateString(
                        'nb-NO',
                        {
                          day: 'numeric',
                          month: 'short',
                        }
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No availability this month.
                </p>
              )}
            </div>
          )}

          {/* Step 3: time */}
          {date != null && (
            <div className="flex flex-col gap-1.5">
              <Label>Available times</Label>
              {timesLoading ? (
                <p className="text-xs text-muted-foreground">Loading times…</p>
              ) : times && times.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {times.map((t) => (
                    <button
                      key={t.time}
                      type="button"
                      onClick={() => setTime(t.time)}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        time === t.time
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background hover:bg-muted'
                      )}
                    >
                      {formatTime(t.time)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No times available on this date.
                </p>
              )}
            </div>
          )}

          {/* Step 4: client details */}
          {time != null && (
            <div className="flex flex-col gap-4 rounded-md border border-border p-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="booking-first">First name</Label>
                  <Input
                    id="booking-first"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="booking-last">Last name</Label>
                  <Input
                    id="booking-last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="booking-email">Email (optional)</Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="booking-phone">Phone (optional)</Label>
                <Input
                  id="booking-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          <SheetFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={!canSubmit || create.isPending}
            >
              {create.isPending ? 'Booking…' : 'Create booking'}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
