import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Heart, PawPrint, Plus, RefreshCcw, Trash2, Utensils } from 'lucide-react'
import './DogCare.css'

const dogDailyTasks = [
  { id: 'morning-food', label: 'Morning food', detail: 'Breakfast / first meal', icon: Utensils },
  { id: 'fresh-water', label: 'Fresh water', detail: 'Refill and clean bowl', icon: Utensils },
  { id: 'walk-one', label: 'Walk 1', detail: 'Morning or midday walk', icon: PawPrint },
  { id: 'walk-two', label: 'Walk 2', detail: 'Evening walk / potty break', icon: PawPrint },
  { id: 'evening-food', label: 'Evening food', detail: 'Dinner / second meal', icon: Utensils },
]

const starterReminders = [
  { id: 'vet-checkup', title: 'Vet checkup', cadence: 'monthly', nextDue: '', note: 'Set first appointment date' },
  { id: 'shots', title: 'Shots / vaccines', cadence: 'monthly', nextDue: '', note: 'Confirm schedule with vet' },
  { id: 'dog-wash', title: 'Dog wash', cadence: 'weekly', nextDue: '', note: 'Bath, brush, ears if needed' },
  { id: 'flea-tick', title: 'Flea / tick meds', cadence: 'monthly', nextDue: '', note: 'Add brand and dose later' },
]

const cadenceOptions = [
  ['daily', 'Daily'],
  ['weekly', 'Weekly'],
  ['biweekly', 'Every 2 weeks'],
  ['monthly', 'Monthly'],
  ['custom', 'Custom'],
]

function getDogState(profile) {
  return {
    name: 'New Pup',
    breed: '',
    birthday: '',
    weight: '',
    vetName: '',
    vetPhone: '',
    dailyDone: {},
    reminders: starterReminders,
    notes: '',
    ...(profile.dogCare ?? {}),
  }
}

function isDoneToday(dog, todayKey, taskId) {
  return Boolean(dog.dailyDone?.[todayKey]?.includes(taskId))
}

function getDueStatus(nextDue) {
  if (!nextDue) return { label: 'Set date', tone: 'unset' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${nextDue}T00:00:00`)
  const diff = Math.round((due - today) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, tone: 'overdue' }
  if (diff === 0) return { label: 'Due today', tone: 'today' }
  if (diff <= 3) return { label: `Due in ${diff}d`, tone: 'soon' }
  return { label: `Due ${nextDue}`, tone: 'ok' }
}

function nextDateFromCadence(cadence) {
  const date = new Date()
  const days = { daily: 1, weekly: 7, biweekly: 14, monthly: 30, custom: 7 }[cadence] ?? 7
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export default function DogCare({ profile, todayKey, onDogCareChange }) {
  const dog = getDogState(profile)
  const [newReminder, setNewReminder] = useState({ title: '', cadence: 'weekly', nextDue: '', note: '' })
  const completedCount = dogDailyTasks.filter((task) => isDoneToday(dog, todayKey, task.id)).length
  const dailyPercent = Math.round((completedCount / dogDailyTasks.length) * 100)
  const dueReminders = useMemo(() => [...dog.reminders].sort((a, b) => (a.nextDue || '9999').localeCompare(b.nextDue || '9999')), [dog.reminders])

  function updateDog(patch) {
    onDogCareChange({ ...dog, ...patch })
  }

  function toggleTask(taskId) {
    const todayDone = dog.dailyDone?.[todayKey] ?? []
    const nextToday = todayDone.includes(taskId) ? todayDone.filter((id) => id !== taskId) : [...todayDone, taskId]
    updateDog({ dailyDone: { ...(dog.dailyDone ?? {}), [todayKey]: nextToday } })
  }

  function addReminder(event) {
    event.preventDefault()
    if (!newReminder.title.trim()) return
    const reminder = {
      id: `dog-reminder-${Date.now()}`,
      title: newReminder.title.trim(),
      cadence: newReminder.cadence,
      nextDue: newReminder.nextDue || nextDateFromCadence(newReminder.cadence),
      note: newReminder.note.trim(),
    }
    updateDog({ reminders: [reminder, ...dog.reminders] })
    setNewReminder({ title: '', cadence: 'weekly', nextDue: '', note: '' })
  }

  function completeReminder(reminder) {
    updateDog({
      reminders: dog.reminders.map((item) => (item.id === reminder.id ? { ...item, nextDue: nextDateFromCadence(item.cadence) } : item)),
    })
  }

  function deleteReminder(id) {
    updateDog({ reminders: dog.reminders.filter((item) => item.id !== id) })
  }

  return (
    <div className="dog-care-layout">
      <section className="dog-hero-card">
        <div className="dog-avatar-bubble">🐶</div>
        <div className="dog-hero-copy">
          <span className="eyebrow">Real-life companion</span>
          <h2>{dog.name || 'Your dog'}</h2>
          <p>Daily care, vet reminders, washes, walks, food, water, and all the “new dog parent” stuff in one place.</p>
          <div className="dog-progress-ring" style={{ '--dog-progress': `${dailyPercent}%` }}>
            <strong>{dailyPercent}%</strong>
            <span>today done</span>
          </div>
        </div>
      </section>

      <section className="dog-card dog-profile-card">
        <div className="section-heading">
          <span className="eyebrow">Profile</span>
          <h2>Pup details</h2>
        </div>
        <div className="dog-form-grid">
          <label><span>Name</span><input value={dog.name} onChange={(event) => updateDog({ name: event.target.value })} placeholder="Dog name" /></label>
          <label><span>Breed</span><input value={dog.breed} onChange={(event) => updateDog({ breed: event.target.value })} placeholder="Breed / mix" /></label>
          <label><span>Birthday / adoption date</span><input type="date" value={dog.birthday} onChange={(event) => updateDog({ birthday: event.target.value })} /></label>
          <label><span>Weight</span><input value={dog.weight} onChange={(event) => updateDog({ weight: event.target.value })} placeholder="Example: 28 lb" /></label>
          <label><span>Vet name</span><input value={dog.vetName} onChange={(event) => updateDog({ vetName: event.target.value })} placeholder="Vet / clinic" /></label>
          <label><span>Vet phone</span><input value={dog.vetPhone} onChange={(event) => updateDog({ vetPhone: event.target.value })} placeholder="Phone" /></label>
        </div>
      </section>

      <section className="dog-card dog-daily-card">
        <div className="section-heading">
          <span className="eyebrow">Daily care</span>
          <h2>Today’s puppy checklist</h2>
        </div>
        <div className="dog-task-list">
          {dogDailyTasks.map((task) => {
            const Icon = task.icon
            const done = isDoneToday(dog, todayKey, task.id)
            return (
              <button className={done ? 'dog-task done' : 'dog-task'} type="button" key={task.id} onClick={() => toggleTask(task.id)}>
                <Icon size={20} />
                <span><strong>{task.label}</strong><small>{task.detail}</small></span>
                {done ? <CheckCircle2 size={20} /> : <Plus size={20} />}
              </button>
            )
          })}
        </div>
      </section>

      <section className="dog-card dog-reminder-card">
        <div className="section-heading">
          <span className="eyebrow">Reminders</span>
          <h2>Vet, shots, washes</h2>
        </div>
        <form className="dog-reminder-form" onSubmit={addReminder}>
          <input value={newReminder.title} onChange={(event) => setNewReminder((current) => ({ ...current, title: event.target.value }))} placeholder="Example: Dog wash" />
          <select value={newReminder.cadence} onChange={(event) => setNewReminder((current) => ({ ...current, cadence: event.target.value }))}>
            {cadenceOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <input type="date" value={newReminder.nextDue} onChange={(event) => setNewReminder((current) => ({ ...current, nextDue: event.target.value }))} />
          <input value={newReminder.note} onChange={(event) => setNewReminder((current) => ({ ...current, note: event.target.value }))} placeholder="Optional note" />
          <button className="primary-button" type="submit"><Plus size={17} />Add</button>
        </form>
        <div className="dog-reminder-list">
          {dueReminders.map((reminder) => {
            const status = getDueStatus(reminder.nextDue)
            return (
              <article className={`dog-reminder due-${status.tone}`} key={reminder.id}>
                <CalendarDays size={20} />
                <div>
                  <h3>{reminder.title}</h3>
                  <p>{reminder.note || cadenceOptions.find(([value]) => value === reminder.cadence)?.[1]}</p>
                  <span>{status.label}</span>
                </div>
                <div className="dog-reminder-actions">
                  <button className="secondary-button" type="button" onClick={() => completeReminder(reminder)}><RefreshCcw size={16} />Done</button>
                  <button className="icon-toggle danger" type="button" onClick={() => deleteReminder(reminder.id)}><Trash2 size={16} /></button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="dog-card dog-notes-card">
        <div className="section-heading">
          <span className="eyebrow">Notes</span>
          <h2>Stuff to remember</h2>
        </div>
        <textarea value={dog.notes} onChange={(event) => updateDog({ notes: event.target.value })} placeholder="Favorite food, commands, potty notes, behavior, medicine instructions..." />
        <div className="dog-love-note"><Heart size={18} /> Congrats on the new dog. This is the good stuff.</div>
      </section>
    </div>
  )
}
