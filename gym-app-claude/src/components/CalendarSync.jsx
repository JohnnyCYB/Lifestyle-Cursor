import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { exportVetAppointment, exportVaccineReminder, exportRepeatingReminder, markSynced, isSynced } from '../services/calendarService'
import './CalendarSync.css'

export function CalendarSyncCard({ isDemo = false }) {
  return <section className="cs-card"><button className="cs-header-btn" type="button"><CalendarDays size={20} /><span><strong>Calendar Sync</strong><small>{isDemo ? 'Off in demo' : 'Phone calendar export ready'}</small></span></button></section>
}

export function AddToCalendarButton({ eventId, type = 'vet', petName = 'Pet', date, notes = '', vaccineName = '', recurrence = 'monthly', isDemo = false }) {
  const [synced, setSynced] = useState(() => isSynced(eventId))
  if (isDemo || !date) return null
  function add() {
    if (type === 'vaccine') exportVaccineReminder({ petName, vaccineName, date, notes })
    else if (['bath', 'flea', 'groom', 'nail'].includes(type)) exportRepeatingReminder({ petName, type, date, recurrence, notes })
    else exportVetAppointment({ petName, date, notes })
    markSynced(eventId)
    setSynced(true)
  }
  return <button className={synced ? 'cs-btn cs-btn-synced' : 'cs-btn cs-btn-cal'} type="button" onClick={add}>{synced ? 'Added' : 'Calendar'}</button>
}
