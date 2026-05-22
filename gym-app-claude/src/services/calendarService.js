export const CALENDAR_MODE = { LOCAL: 'local', GOOGLE: 'google' }
export const GOOGLE_CALENDAR_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
export function getCalendarMode() { return GOOGLE_CALENDAR_ENABLED ? CALENDAR_MODE.GOOGLE : CALENDAR_MODE.LOCAL }

const pad = (n) => String(n).padStart(2, '0')
const clean = (value = '') => String(value).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
function slug(value = 'pet') { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
function toICSDate(value, allDay = false) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  if (allDay) return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`
}
function recurrenceLine(recurrence, interval = 1) {
  const map = { weekly: 'WEEKLY', monthly: 'MONTHLY', yearly: 'YEARLY' }
  return map[recurrence] ? `RRULE:FREQ=${map[recurrence]};INTERVAL=${interval}` : ''
}
export function generateICS({ title, start, end, description = '', location = '', allDay = false, recurrence, recurrenceInterval = 1, alarmMinutes = 60 }) {
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60 * 1000)
  const dtStart = toICSDate(startDate, allDay)
  const dtEnd = toICSDate(endDate, allDay)
  const stamp = toICSDate(new Date())
  if (!dtStart || !title) return ''
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LifeRPG//DogCare//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@liferpg`, `DTSTAMP:${stamp}Z`,
    allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    allDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`,
    `SUMMARY:${clean(title)}`, description ? `DESCRIPTION:${clean(description)}` : '', location ? `LOCATION:${clean(location)}` : '',
    recurrenceLine(recurrence, recurrenceInterval),
    alarmMinutes !== false ? ['BEGIN:VALARM', `TRIGGER:-PT${alarmMinutes}M`, 'ACTION:DISPLAY', `DESCRIPTION:${clean(title)}`, 'END:VALARM'].join('\n') : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\n')
}
export function downloadICS(icsContent, filename = 'event.ics') {
  if (!icsContent) return
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
export const vetEventTitle = (petName) => `Vet Visit — ${petName}`
export const vaccineEventTitle = (petName, vaccine) => `Vaccine Due — ${petName} — ${vaccine}`
export const bathEventTitle = (petName) => `Bath Day — ${petName}`
export const fleaEventTitle = (petName) => `Flea/Tick Meds — ${petName}`
export const groomEventTitle = (petName) => `Grooming — ${petName}`
export const nailEventTitle = (petName) => `Nail Trim — ${petName}`
export function exportVetAppointment({ petName, date, notes = '', location = '' }) { downloadICS(generateICS({ title: vetEventTitle(petName), start: date, description: notes, location }), `vet-${slug(petName)}.ics`) }
export function exportVaccineReminder({ petName, vaccineName, date, notes = '' }) { downloadICS(generateICS({ title: vaccineEventTitle(petName, vaccineName || 'Shot'), start: date, description: notes, allDay: true, alarmMinutes: 1440 }), `vaccine-${slug(petName)}-${slug(vaccineName)}.ics`) }
export function exportRepeatingReminder({ petName, type, date, recurrence = 'monthly', notes = '' }) {
  const names = { bath: bathEventTitle, flea: fleaEventTitle, groom: groomEventTitle, nail: nailEventTitle }
  downloadICS(generateICS({ title: names[type] ? names[type](petName) : `${type} — ${petName}`, start: date, description: notes, recurrence }), `${slug(type)}-${slug(petName)}.ics`)
}
const SYNC_KEY = 'liferpg_calendar_synced'
export function markSynced(id) { const values = new Set(JSON.parse(localStorage.getItem(SYNC_KEY) || '[]')); values.add(id); localStorage.setItem(SYNC_KEY, JSON.stringify([...values])) }
export function isSynced(id) { try { return JSON.parse(localStorage.getItem(SYNC_KEY) || '[]').includes(id) } catch { return false } }
export function getUpcomingCalendarEvents(dogCare = {}) {
  const petName = dogCare.name || dogCare.pets?.[0]?.name || 'Pet'
  const appointments = dogCare.appointments || []
  const reminders = dogCare.reminders || []
  const vaccines = dogCare.vaccines || []
  return [
    ...appointments.map((a) => ({ id: a.id, title: vetEventTitle(a.petName || petName), date: new Date(a.date), type: 'vet' })),
    ...reminders.map((r) => ({ id: r.id, title: r.title || `Reminder — ${r.petName || petName}`, date: new Date(r.nextDue || r.nextDate || r.date), type: r.type || 'reminder' })),
    ...vaccines.map((v) => ({ id: v.id, title: vaccineEventTitle(v.petName || petName, v.name || 'Shot'), date: new Date(v.nextDue || v.dueDate), type: 'vaccine' })),
  ].filter((event) => event.id && !Number.isNaN(event.date.getTime())).sort((a, b) => a.date - b.date)
}
