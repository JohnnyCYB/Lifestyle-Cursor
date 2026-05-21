import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Heart,
  NotebookPen,
  PawPrint,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Syringe,
  Trash2,
  Utensils,
} from 'lucide-react'
import './DogCare.css'

const dogDailyTasks = [
  { id: 'morning-food', label: 'Morning food', detail: 'Breakfast / first meal', icon: Utensils },
  { id: 'fresh-water', label: 'Fresh water', detail: 'Refill and clean bowl', icon: Utensils },
  { id: 'walk-one', label: 'Walk 1', detail: 'Morning or midday walk', icon: PawPrint },
  { id: 'walk-two', label: 'Walk 2', detail: 'Evening walk / potty break', icon: PawPrint },
  { id: 'play-training', label: 'Play / training', detail: 'Fetch, commands, enrichment', icon: Heart },
  { id: 'evening-food', label: 'Evening food', detail: 'Dinner / second meal', icon: Utensils },
]

const starterReminders = [
  { id: 'vet-checkup', title: 'Vet checkup', cadence: 'monthly', nextDue: '', note: 'Set first appointment date' },
  { id: 'shots', title: 'Shots / vaccines', cadence: 'monthly', nextDue: '', note: 'Confirm schedule with vet' },
  { id: 'dog-wash', title: 'Dog wash', cadence: 'weekly', nextDue: '', note: 'Bath, brush, ears if needed' },
  { id: 'flea-tick', title: 'Flea / tick meds', cadence: 'monthly', nextDue: '', note: 'Add brand and dose later' },
  { id: 'nails', title: 'Nail trim', cadence: 'biweekly', nextDue: '', note: 'Trim or schedule groomer' },
]

const starterVaccines = [
  { id: 'rabies', name: 'Rabies', dateGiven: '', nextDue: '', vet: '', notes: '' },
  { id: 'dhpp', name: 'DHPP / Distemper', dateGiven: '', nextDue: '', vet: '', notes: '' },
  { id: 'bordetella', name: 'Bordetella', dateGiven: '', nextDue: '', vet: '', notes: '' },
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
    name: 'Silly Dog',
    breed: 'Pit mix',
    birthday: '',
    adoptionDate: '',
    weight: '',
    color: 'gray / white',
    collar: 'pink collar',
    microchip: '',
    vetName: '',
    vetPhone: '',
    foodBrand: '',
    foodType: '',
    feedingAmount: '',
    feedingSchedule: 'Morning + evening',
    treats: '',
    allergies: '',
    exerciseGoal: '2 walks + play time',
    walkMinutesGoal: 45,
    dailyDone: {},
    dailyExercise: {},
    reminders: starterReminders,
    vaccines: starterVaccines,
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
  if (diff <= 7) return { label: `Due in ${diff}d`, tone: 'soon' }
  return { label: `Due ${nextDue}`, tone: 'ok' }
}

function nextDateFromCadence(cadence) {
  const date = new Date()
  const days = { daily: 1, weekly: 7, biweekly: 14, monthly: 30, custom: 7 }[cadence] ?? 7
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function emptyVaccine() {
  return { id: `vaccine-${Date.now()}`, name: '', dateGiven: '', nextDue: '', vet: '', notes: '' }
}

export default function DogCare({ profile, todayKey, onDogCareChange }) {
  const dog = getDogState(profile)
  const [newReminder, setNewReminder] = useState({ title: '', cadence: 'weekly', nextDue: '', note: '' })
  const [newVaccine, setNewVaccine] = useState(emptyVaccine())
  const [walkMinutes, setWalkMinutes] = useState('')
  const completedCount = dogDailyTasks.filter((task) => isDoneToday(dog, todayKey, task.id)).length
  const dailyPercent = Math.round((completedCount / dogDailyTasks.length) * 100)
  const todayExercise = dog.dailyExercise?.[todayKey] ?? { walks: 0, minutes: 0 }
  const walkGoal = Number(dog.walkMinutesGoal) || 45
  const exercisePercent = Math.min(100, Math.round(((todayExercise.minutes ?? 0) / walkGoal) * 100))
  const dueReminders = useMemo(() => [...dog.reminders].sort((a, b) => (a.nextDue || '9999').localeCompare(b.nextDue || '9999')), [dog.reminders])
  const upcomingVaccines = useMemo(() => [...dog.vaccines].sort((a, b) => (a.nextDue || '9999').localeCompare(b.nextDue || '9999')), [dog.vaccines])

  function updateDog(patch) {
    onDogCareChange({ ...dog, ...patch })
  }

  function toggleTask(taskId) {
    const todayDone = dog.dailyDone?.[todayKey] ?? []
    const nextToday = todayDone.includes(taskId) ? todayDone.filter((id) => id !== taskId) : [...todayDone, taskId]
    updateDog({ dailyDone: { ...(dog.dailyDone ?? {}), [todayKey]: nextToday } })
  }

  function addWalk(event) {
    event.preventDefault()
    const minutes = Math.max(1, Number(walkMinutes) || 15)
    updateDog({
      dailyExercise: {
        ...(dog.dailyExercise ?? {}),
        [todayKey]: {
          walks: (todayExercise.walks ?? 0) + 1,
          minutes: (todayExercise.minutes ?? 0) + minutes,
        },
      },
    })
    setWalkMinutes('')
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
    updateDog({ reminders: dog.reminders.map((item) => (item.id === reminder.id ? { ...item, nextDue: nextDateFromCadence(item.cadence) } : item)) })
  }

  function deleteReminder(id) {
    updateDog({ reminders: dog.reminders.filter((item) => item.id !== id) })
  }

  function saveVaccine(event) {
    event.preventDefault()
    if (!newVaccine.name.trim()) return
    updateDog({ vaccines: [{ ...newVaccine, name: newVaccine.name.trim() }, ...dog.vaccines] })
    setNewVaccine(emptyVaccine())
  }

  function updateVaccine(id, patch) {
    updateDog({ vaccines: dog.vaccines.map((item) => (item.id === id ? { ...item, ...patch } : item)) })
  }

  function deleteVaccine(id) {
    updateDog({ vaccines: dog.vaccines.filter((item) => item.id !== id) })
  }

  return (
    <div className="dog-care-layout">
      <section className="dog-hero-card dog-hero-photo-card">
        <div className="dog-photo-frame">
          <div className="dog-photo-fallback">🐶</div>
        </div>
        <div className="dog-hero-copy">
          <span className="eyebrow">Real-life companion</span>
          <h2>{dog.name || 'Your dog'}</h2>
          <p>{dog.breed || 'Pit mix'} · {dog.color || 'gray / white'} · {dog.collar || 'pink collar'} · ridiculous puppy eyes unlocked.</p>
          <div className="dog-hero-stats">
            <div className="dog-progress-ring" style={{ '--dog-progress': `${dailyPercent}%` }}><strong>{dailyPercent}%</strong><span>care done</span></div>
            <div className="dog-progress-ring walk-ring" style={{ '--dog-progress': `${exercisePercent}%` }}><strong>{todayExercise.minutes ?? 0}m</strong><span>walk time</span></div>
          </div>
        </div>
      </section>

      <section className="dog-card dog-profile-card">
        <div className="section-heading"><span className="eyebrow">Profile</span><h2>Silly dog details</h2></div>
        <div className="dog-form-grid">
          <label><span>Name</span><input value={dog.name} onChange={(event) => updateDog({ name: event.target.value })} placeholder="Dog name" /></label>
          <label><span>Breed</span><input value={dog.breed} onChange={(event) => updateDog({ breed: event.target.value })} placeholder="Pit mix / rescue mix" /></label>
          <label><span>Adoption date</span><input type="date" value={dog.adoptionDate} onChange={(event) => updateDog({ adoptionDate: event.target.value })} /></label>
          <label><span>Birthday / estimated age</span><input value={dog.birthday} onChange={(event) => updateDog({ birthday: event.target.value })} placeholder="Birthday or estimated age" /></label>
          <label><span>Weight</span><input value={dog.weight} onChange={(event) => updateDog({ weight: event.target.value })} placeholder="Example: 45 lb" /></label>
          <label><span>Microchip #</span><input value={dog.microchip} onChange={(event) => updateDog({ microchip: event.target.value })} placeholder="Optional" /></label>
          <label><span>Vet name</span><input value={dog.vetName} onChange={(event) => updateDog({ vetName: event.target.value })} placeholder="Vet / clinic" /></label>
          <label><span>Vet phone</span><input value={dog.vetPhone} onChange={(event) => updateDog({ vetPhone: event.target.value })} placeholder="Phone" /></label>
        </div>
      </section>

      <section className="dog-card dog-daily-card">
        <div className="section-heading"><span className="eyebrow">Daily care</span><h2>Today’s checklist</h2></div>
        <div className="dog-task-list">
          {dogDailyTasks.map((task) => {
            const Icon = task.icon
            const done = isDoneToday(dog, todayKey, task.id)
            return <button className={done ? 'dog-task done' : 'dog-task'} type="button" key={task.id} onClick={() => toggleTask(task.id)}><Icon size={20} /><span><strong>{task.label}</strong><small>{task.detail}</small></span>{done ? <CheckCircle2 size={20} /> : <Plus size={20} />}</button>
          })}
        </div>
      </section>

      <section className="dog-card dog-food-card">
        <div className="section-heading"><span className="eyebrow">Food</span><h2>Food type & feeding plan</h2></div>
        <div className="dog-form-grid">
          <label><span>Food brand</span><input value={dog.foodBrand} onChange={(event) => updateDog({ foodBrand: event.target.value })} placeholder="Brand name" /></label>
          <label><span>Food type</span><input value={dog.foodType} onChange={(event) => updateDog({ foodType: event.target.value })} placeholder="Kibble, wet, fresh, mix" /></label>
          <label><span>Amount</span><input value={dog.feedingAmount} onChange={(event) => updateDog({ feedingAmount: event.target.value })} placeholder="Example: 1 cup twice daily" /></label>
          <label><span>Schedule</span><input value={dog.feedingSchedule} onChange={(event) => updateDog({ feedingSchedule: event.target.value })} placeholder="Morning + evening" /></label>
          <label><span>Treats</span><input value={dog.treats} onChange={(event) => updateDog({ treats: event.target.value })} placeholder="Training treats, dental chews" /></label>
          <label><span>Allergies / avoid</span><input value={dog.allergies} onChange={(event) => updateDog({ allergies: event.target.value })} placeholder="Chicken, grains, etc." /></label>
        </div>
      </section>

      <section className="dog-card dog-exercise-card">
        <div className="section-heading"><span className="eyebrow">Exercise</span><h2>Walks & play</h2></div>
        <div className="dog-exercise-dashboard">
          <div><strong>{todayExercise.walks ?? 0}</strong><span>walks today</span></div>
          <div><strong>{todayExercise.minutes ?? 0}</strong><span>minutes</span></div>
          <div><strong>{walkGoal}</strong><span>minute goal</span></div>
        </div>
        <form className="dog-walk-form" onSubmit={addWalk}>
          <input type="number" min="1" value={walkMinutes} onChange={(event) => setWalkMinutes(event.target.value)} placeholder="Minutes walked" />
          <button className="primary-button" type="submit"><PawPrint size={17} />Log walk</button>
        </form>
        <label className="dog-single-field"><span>Daily exercise goal</span><input value={dog.exerciseGoal} onChange={(event) => updateDog({ exerciseGoal: event.target.value })} placeholder="2 walks + play time" /></label>
        <label className="dog-single-field"><span>Walk minutes goal</span><input type="number" min="1" value={dog.walkMinutesGoal} onChange={(event) => updateDog({ walkMinutesGoal: event.target.value })} /></label>
      </section>

      <section className="dog-card dog-vaccine-card">
        <div className="section-heading"><span className="eyebrow">Shot record</span><h2>Vaccines & medical</h2></div>
        <form className="dog-vaccine-form" onSubmit={saveVaccine}>
          <input value={newVaccine.name} onChange={(event) => setNewVaccine((current) => ({ ...current, name: event.target.value }))} placeholder="Vaccine / medicine" />
          <input type="date" value={newVaccine.dateGiven} onChange={(event) => setNewVaccine((current) => ({ ...current, dateGiven: event.target.value }))} />
          <input type="date" value={newVaccine.nextDue} onChange={(event) => setNewVaccine((current) => ({ ...current, nextDue: event.target.value }))} />
          <input value={newVaccine.vet} onChange={(event) => setNewVaccine((current) => ({ ...current, vet: event.target.value }))} placeholder="Vet / clinic" />
          <button className="primary-button" type="submit"><Syringe size={17} />Add</button>
        </form>
        <div className="dog-vaccine-list">
          {upcomingVaccines.map((vaccine) => {
            const status = getDueStatus(vaccine.nextDue)
            return <article className={`dog-vaccine due-${status.tone}`} key={vaccine.id}><ShieldCheck size={20} /><div><input value={vaccine.name} onChange={(event) => updateVaccine(vaccine.id, { name: event.target.value })} placeholder="Vaccine" /><small>Given: {vaccine.dateGiven || 'not logged'} · {status.label}</small><input value={vaccine.notes} onChange={(event) => updateVaccine(vaccine.id, { notes: event.target.value })} placeholder="Notes" /></div><button className="icon-toggle danger" type="button" onClick={() => deleteVaccine(vaccine.id)}><Trash2 size={16} /></button></article>
          })}
        </div>
      </section>

      <section className="dog-card dog-reminder-card">
        <div className="section-heading"><span className="eyebrow">Upcoming</span><h2>Vet, wash, meds</h2></div>
        <form className="dog-reminder-form" onSubmit={addReminder}>
          <input value={newReminder.title} onChange={(event) => setNewReminder((current) => ({ ...current, title: event.target.value }))} placeholder="Example: Dog wash" />
          <select value={newReminder.cadence} onChange={(event) => setNewReminder((current) => ({ ...current, cadence: event.target.value }))}>{cadenceOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
          <input type="date" value={newReminder.nextDue} onChange={(event) => setNewReminder((current) => ({ ...current, nextDue: event.target.value }))} />
          <input value={newReminder.note} onChange={(event) => setNewReminder((current) => ({ ...current, note: event.target.value }))} placeholder="Optional note" />
          <button className="primary-button" type="submit"><Plus size={17} />Add</button>
        </form>
        <div className="dog-reminder-list">
          {dueReminders.map((reminder) => {
            const status = getDueStatus(reminder.nextDue)
            return <article className={`dog-reminder due-${status.tone}`} key={reminder.id}><CalendarDays size={20} /><div><h3>{reminder.title}</h3><p>{reminder.note || cadenceOptions.find(([value]) => value === reminder.cadence)?.[1]}</p><span>{status.label}</span></div><div className="dog-reminder-actions"><button className="secondary-button" type="button" onClick={() => completeReminder(reminder)}><RefreshCcw size={16} />Done</button><button className="icon-toggle danger" type="button" onClick={() => deleteReminder(reminder.id)}><Trash2 size={16} /></button></div></article>
          })}
        </div>
      </section>

      <section className="dog-card dog-notes-card">
        <div className="section-heading"><span className="eyebrow">Notes</span><h2>Stuff to remember</h2></div>
        <textarea value={dog.notes} onChange={(event) => updateDog({ notes: event.target.value })} placeholder="Favorite food, commands, potty notes, behavior, medicine instructions, what the shelter/vet said..." />
        <div className="dog-love-note"><NotebookPen size={18} /> Add anything important here so new-dog chaos does not eat your brain.</div>
      </section>
    </div>
  )
}
