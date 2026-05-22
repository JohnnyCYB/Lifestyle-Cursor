import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import {
  exportRepeatingReminder,
  exportVaccineReminder,
  exportVetAppointment,
  getUpcomingCalendarEvents,
  isSynced,
  markSynced,
} from '../services/calendarService'
import './CalendarSync.css'

function formatCalendarDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return 'Date not set'
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function CalendarSyncCard({ dogCarePayload = null, isDemo = false }) {
  const upcoming = useMemo(() => getUpcomingCalendarEvents(dogCarePayload ?? {}).slice(0, 3), [dogCarePayload])
  const summaryLabel = isDemo
    ? 'Off in demo'
    : upcoming.length
      ? `${upcoming.length} upcoming care ${upcoming.length === 1 ? 'event' : 'events'}`
      : 'Phone calendar export ready'

  return (
    <section className="cs-card">
      <button className="cs-header-btn" type="button">
        <CalendarDays size={20} />
        <span>
          <strong>Calendar Sync</strong>
          <small>{summaryLabel}</small>
        </span>
      </button>
      {!isDemo && (
        <div className="cs-body">
          {upcoming.length ? upcoming.map((event) => (
            <div className="cs-event-row" key={event.id}>
              <span>
                <strong>{event.title}</strong>
                <small>{formatCalendarDate(event.date)}</small>
              </span>
            </div>
          )) : <p className="cs-empty">Add a reminder, appointment, or vaccine to preview upcoming calendar exports.</p>}
        </div>
      )}
    </section>
  )
}

export function AddToCalendarButton({
  eventId,
  type = 'vet',
  petName = 'Pet',
  date,
  notes = '',
  vaccineName = '',
  recurrence = 'monthly',
  isDemo = false,
}) {
  const [localSyncedIds, setLocalSyncedIds] = useState(() => new Set())
  const synced = Boolean(eventId) && (localSyncedIds.has(eventId) || isSynced(eventId))

  if (isDemo || !date) return null

  function add() {
    if (type === 'vaccine') exportVaccineReminder({ petName, vaccineName, date, notes })
    else if (['bath', 'flea', 'groom', 'nail'].includes(type)) exportRepeatingReminder({ petName, type, date, recurrence, notes })
    else exportVetAppointment({ petName, date, notes })

    if (eventId) {
      markSynced(eventId)
      setLocalSyncedIds((current) => new Set(current).add(eventId))
    }
  }

  return <button className={synced ? 'cs-btn cs-btn-synced' : 'cs-btn cs-btn-cal'} type="button" onClick={add}>{synced ? 'Added' : 'Calendar'}</button>
}
