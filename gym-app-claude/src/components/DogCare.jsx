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
  Weight,
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
  { id: 'vet-checkup', title: 'Vet checkup', type: 'Vet', cadence: 'monthly', nextDue: '', note: 'Set first appointment date', completedDates: [] },
  { id: 'shots', title: 'Shots / vaccines', type: 'Medical', cadence: 'monthly', nextDue: '', note: 'Confirm schedule with vet', completedDates: [] },
  { id: 'dog-wash', title: 'Dog wash', type: 'Grooming', cadence: 'weekly', nextDue: '', note: 'Bath, brush, ears if needed', completedDates: [] },
  { id: 'flea-tick', title: 'Flea / tick meds', type: 'Medicine', cadence: 'monthly', nextDue: '', note: 'Add brand and dose later', completedDates: [] },
  { id: 'nails', title: 'Nail trim', type: 'Grooming', cadence: 'biweekly', nextDue: '', note: 'Trim or schedule groomer', completedDates: [] },
]

const starterVaccines = [
  { id: 'rabies', name: 'Rabies', dateGiven: '', nextDue: '', vet: '', lot: '', notes: '' },
  { id: 'dhpp', name: 'DHPP / Distemper', dateGiven: '', nextDue: '', vet: '', lot: '', notes: '' },
  { id: 'bordetella', name: 'Bordetella', dateGiven: '', nextDue: '', vet: '', lot: '', notes: '' },
]

const cadenceOptions = [
  ['daily', 'Daily'],
  ['weekly', 'Weekly'],
  ['biweekly', 'Every 2 weeks'],
  ['monthly', 'Monthly'],
  ['quarterly', 'Every 3 months'],
  ['yearly', 'Yearly'],
  ['custom', 'Custom'],
]

function createPet(overrides = {}) {
  const id = overrides.id ?? `real-pet-${Date.now()}`
  return {
    id,
    name: 'New Pup',
    species: 'Dog',
    breed: 'Pit mix',
    birthday: '',
    adoptionDate: '',
    sex: '',
    weight: '',
    size: '',
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
    appointments: [],
    reminders: starterReminders,
    vaccines: starterVaccines,
    weightHistory: [],
    bathHistory: [],
    notes: '',
    ...overrides,
  }
}

function normalizeDogCare(raw) {
  if (raw?.pets?.length) {
    const pets = raw.pets.map((pet) => createPet(pet))
    return { pets, activePetId: raw.activePetId ?? pets[0].id }
  }
  const legacyPet = createPet({ ...(raw ?? {}), id: 'real-pet-main' })
  return { pets: [legacyPet], activePetId: legacyPet.id }
}

function getDogState(profile) {
  return normalizeDogCare(profile.dogCare)
}

function getActivePet(dogCare) {
  return dogCare.pets.find((pet) => pet.id === dogCare.activePetId) ?? dogCare.pets[0] ?? createPet({ id: 'real-pet-main' })
}

function isDoneToday(pet, todayKey, taskId) {
  return Boolean(pet.dailyDone?.[todayKey]?.includes(taskId))
}

function getDueStatus(nextDue) {
  if (!nextDue) return { label: 'Set date', tone: 'unset', days: 9999 }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${nextDue}T00:00:00`)
  const diff = Math.round((due - today) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, tone: 'overdue', days: diff }
  if (diff === 0) return { label: 'Due today', tone: 'today', days: 0 }
  if (diff <= 7) return { label: `Due in ${diff}d`, tone: 'soon', days: diff }
  return { label: `Due ${nextDue}`, tone: 'ok', days: diff }
}

function nextDateFromCadence(cadence) {
  const date = new Date()
  const days = { daily: 1, weekly: 7, biweekly: 14, monthly: 30, quarterly: 90, yearly: 365, custom: 7 }[cadence] ?? 7
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function emptyVaccine() {
  return { id: `vaccine-${Date.now()}`, name: '', dateGiven: '', nextDue: '', vet: '', lot: '', notes: '' }
}

function emptyAppointment() {
  return { id: `appt-${Date.now()}`, title: '', date: '', type: 'Vet', provider: '', notes: '', completed: false }
}

function todayKeyString() {
  return new Date().toISOString().slice(0, 10)
}

export default function DogCare({ profile, todayKey, onDogCareChange }) {
  const dogCare = getDogState(profile)
  const pet = getActivePet(dogCare)
  const [newReminder, setNewReminder] = useState({ title: '', type: 'Care', cadence: 'weekly', nextDue: '', note: '' })
  const [newVaccine, setNewVaccine] = useState(emptyVaccine())
  const [newAppointment, setNewAppointment] = useState(emptyAppointment())
  const [newWeight, setNewWeight] = useState('')
  const [newWeightNote, setNewWeightNote] = useState('')
  const [walkMinutes, setWalkMinutes] = useState('')

  const completedCount = dogDailyTasks.filter((task) => isDoneToday(pet, todayKey, task.id)).length
  const dailyPercent = Math.round((completedCount / dogDailyTasks.length) * 100)
  const todayExercise = pet.dailyExercise?.[todayKey] ?? { walks: 0, minutes: 0 }
  const walkGoal = Number(pet.walkMinutesGoal) || 45
  const exercisePercent = Math.min(100, Math.round(((todayExercise.minutes ?? 0) / walkGoal) * 100))
  const nextReminder = useMemo(() => [...pet.reminders].sort((a, b) => getDueStatus(a.nextDue).days - getDueStatus(b.nextDue).days)[0], [pet.reminders])
  const upcomingAppointments = useMemo(() => [...pet.appointments].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999')), [pet.appointments])
  const dueReminders = useMemo(() => [...pet.reminders].sort((a, b) => (a.nextDue || '9999').localeCompare(b.nextDue || '9999')), [pet.reminders])
  const upcomingVaccines = useMemo(() => [...pet.vaccines].sort((a, b) => (a.nextDue || '9999').localeCompare(b.nextDue || '9999')), [pet.vaccines])
  const latestBath = pet.bathHistory?.[0]
  const latestWeight = pet.weightHistory?.[0]?.weight || pet.weight || 'Not logged'

  function updateDogCare(nextDogCare) {
    onDogCareChange(nextDogCare)
  }

  function updatePet(patch) {
    updateDogCare({
      ...dogCare,
      pets: dogCare.pets.map((candidate) => (candidate.id === pet.id ? { ...candidate, ...patch } : candidate)),
      activePetId: pet.id,
    })
  }

  function addPet() {
    const newPet = createPet({ id: `real-pet-${Date.now()}`, name: `Pet ${dogCare.pets.length + 1}`, breed: '', color: '', collar: '' })
    updateDogCare({ pets: [...dogCare.pets, newPet], activePetId: newPet.id })
  }

  function deleteActivePet() {
    if (dogCare.pets.length <= 1) return
    const remaining = dogCare.pets.filter((candidate) => candidate.id !== pet.id)
    updateDogCare({ pets: remaining, activePetId: remaining[0].id })
  }

  function toggleTask(taskId) {
    const todayDone = pet.dailyDone?.[todayKey] ?? []
    const nextToday = todayDone.includes(taskId) ? todayDone.filter((id) => id !== taskId) : [...todayDone, taskId]
    updatePet({ dailyDone: { ...(pet.dailyDone ?? {}), [todayKey]: nextToday } })
  }

  function addWalk(event) {
    event.preventDefault()
    const minutes = Math.max(1, Number(walkMinutes) || 15)
    updatePet({
      dailyExercise: {
        ...(pet.dailyExercise ?? {}),
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
      id: `pet-reminder-${Date.now()}`,
      title: newReminder.title.trim(),
      type: newReminder.type,
      cadence: newReminder.cadence,
      nextDue: newReminder.nextDue || nextDateFromCadence(newReminder.cadence),
      note: newReminder.note.trim(),
      completedDates: [],
    }
    updatePet({ reminders: [reminder, ...pet.reminders] })
    setNewReminder({ title: '', type: 'Care', cadence: 'weekly', nextDue: '', note: '' })
  }

  function completeReminder(reminder) {
    updatePet({
      reminders: pet.reminders.map((item) =>
        item.id === reminder.id
          ? { ...item, nextDue: nextDateFromCadence(item.cadence), completedDates: [todayKeyString(), ...(item.completedDates ?? [])].slice(0, 12) }
          : item,
      ),
    })
  }

  function deleteReminder(id) {
    updatePet({ reminders: pet.reminders.filter((item) => item.id !== id) })
  }

  function saveVaccine(event) {
    event.preventDefault()
    if (!newVaccine.name.trim()) return
    updatePet({ vaccines: [{ ...newVaccine, name: newVaccine.name.trim() }, ...pet.vaccines] })
    setNewVaccine(emptyVaccine())
  }

  function updateVaccine(id, patch) {
    updatePet({ vaccines: pet.vaccines.map((item) => (item.id === id ? { ...item, ...patch } : item)) })
  }

  function deleteVaccine(id) {
    updatePet({ vaccines: pet.vaccines.filter((item) => item.id !== id) })
  }

  function saveAppointment(event) {
    event.preventDefault()
    if (!newAppointment.title.trim()) return
    updatePet({ appointments: [{ ...newAppointment, title: newAppointment.title.trim() }, ...pet.appointments] })
    setNewAppointment(emptyAppointment())
  }

  function toggleAppointment(id) {
    updatePet({ appointments: pet.appointments.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)) })
  }

  function deleteAppointment(id) {
    updatePet({ appointments: pet.appointments.filter((item) => item.id !== id) })
  }

  function saveWeight(event) {
    event.preventDefault()
    if (!newWeight.trim()) return
    updatePet({
      weight: newWeight.trim(),
      weightHistory: [{ id: `weight-${Date.now()}`, date: todayKeyString(), weight: newWeight.trim(), note: newWeightNote.trim() }, ...(pet.weightHistory ?? [])].slice(0, 24),
    })
    setNewWeight('')
    setNewWeightNote('')
  }

  function logBath() {
    updatePet({ bathHistory: [{ id: `bath-${Date.now()}`, date: todayKeyString(), note: 'Bath / wash logged' }, ...(pet.bathHistory ?? [])].slice(0, 24) })
  }

  return (
    <div className="dog-care-layout pet-profile-system">
      <section className="dog-hero-card dog-hero-photo-card">
        <div className="dog-photo-frame"><div className="dog-photo-fallback">🐶</div></div>
        <div className="dog-hero-copy">
          <span className="eyebrow">Real pet profile</span>
          <h2>{pet.name || 'Your pet'}</h2>
          <p>{pet.breed || pet.species || 'Dog'} · {pet.color || 'color not set'} · {pet.collar || 'collar not set'} · tracked like she deserves.</p>
          <div className="dog-hero-stats">
            <div className="dog-progress-ring" style={{ '--dog-progress': `${dailyPercent}%` }}><strong>{dailyPercent}%</strong><span>care done</span></div>
            <div className="dog-progress-ring walk-ring" style={{ '--dog-progress': `${exercisePercent}%` }}><strong>{todayExercise.minutes ?? 0}m</strong><span>walk time</span></div>
            <div className="dog-progress-ring weight-ring" style={{ '--dog-progress': '100%' }}><strong>{latestWeight}</strong><span>latest weight</span></div>
          </div>
        </div>
      </section>

      <section className="dog-card pet-switch-card">
        <div className="section-heading"><span className="eyebrow">Pet profiles</span><h2>Choose or add pet</h2></div>
        <div className="pet-profile-tabs">
          {dogCare.pets.map((candidate) => (
            <button key={candidate.id} type="button" aria-pressed={candidate.id === pet.id} onClick={() => updateDogCare({ ...dogCare, activePetId: candidate.id })}>
              <span>🐶</span>
              <strong>{candidate.name || 'Pet'}</strong>
              <small>{candidate.breed || candidate.species || 'Dog'}</small>
            </button>
          ))}
          <button className="add-pet-card" type="button" onClick={addPet}><Plus size={18} /><strong>Add pet</strong><small>New profile</small></button>
        </div>
        {dogCare.pets.length > 1 && <button className="secondary-button danger-soft" type="button" onClick={deleteActivePet}><Trash2 size={16} />Remove active pet</button>}
      </section>

      <section className="dog-card dog-summary-card">
        <div className="section-heading"><span className="eyebrow">At a glance</span><h2>What matters next</h2></div>
        <div className="dog-summary-grid">
          <article><CalendarDays size={20} /><span>Next reminder</span><strong>{nextReminder ? getDueStatus(nextReminder.nextDue).label : 'None'}</strong><small>{nextReminder?.title ?? 'Add care reminders'}</small></article>
          <article><Syringe size={20} /><span>Next shot</span><strong>{upcomingVaccines[0] ? getDueStatus(upcomingVaccines[0].nextDue).label : 'None'}</strong><small>{upcomingVaccines[0]?.name ?? 'Log vaccines'}</small></article>
          <article><PawPrint size={20} /><span>Last bath</span><strong>{latestBath?.date ?? 'Not logged'}</strong><small>Bath / grooming history</small></article>
          <article><Weight size={20} /><span>Size / weight</span><strong>{pet.size || latestWeight}</strong><small>{pet.weightHistory?.length ? `${pet.weightHistory.length} weigh-ins` : 'Start tracking'}</small></article>
        </div>
      </section>

      <section className="dog-card dog-profile-card">
        <div className="section-heading"><span className="eyebrow">Profile</span><h2>Pet details</h2></div>
        <div className="dog-form-grid">
          <label><span>Name</span><input value={pet.name} onChange={(event) => updatePet({ name: event.target.value })} placeholder="Pet name" /></label>
          <label><span>Species</span><input value={pet.species} onChange={(event) => updatePet({ species: event.target.value })} placeholder="Dog, cat, etc." /></label>
          <label><span>Breed</span><input value={pet.breed} onChange={(event) => updatePet({ breed: event.target.value })} placeholder="Pit mix / rescue mix" /></label>
          <label><span>Sex</span><input value={pet.sex} onChange={(event) => updatePet({ sex: event.target.value })} placeholder="Female / male" /></label>
          <label><span>Adoption date</span><input type="date" value={pet.adoptionDate} onChange={(event) => updatePet({ adoptionDate: event.target.value })} /></label>
          <label><span>Birthday / estimated age</span><input value={pet.birthday} onChange={(event) => updatePet({ birthday: event.target.value })} placeholder="Birthday or estimated age" /></label>
          <label><span>Size</span><input value={pet.size} onChange={(event) => updatePet({ size: event.target.value })} placeholder="Small, medium, 45 lb, growing" /></label>
          <label><span>Current weight</span><input value={pet.weight} onChange={(event) => updatePet({ weight: event.target.value })} placeholder="Example: 45 lb" /></label>
          <label><span>Color / markings</span><input value={pet.color} onChange={(event) => updatePet({ color: event.target.value })} placeholder="Gray and white" /></label>
          <label><span>Collar / tag</span><input value={pet.collar} onChange={(event) => updatePet({ collar: event.target.value })} placeholder="Pink collar" /></label>
          <label><span>Microchip #</span><input value={pet.microchip} onChange={(event) => updatePet({ microchip: event.target.value })} placeholder="Optional" /></label>
          <label><span>Vet phone</span><input value={pet.vetPhone} onChange={(event) => updatePet({ vetPhone: event.target.value })} placeholder="Phone" /></label>
          <label><span>Vet / clinic</span><input value={pet.vetName} onChange={(event) => updatePet({ vetName: event.target.value })} placeholder="Vet / clinic" /></label>
          <label><span>Insurance / plan</span><input value={pet.insurance ?? ''} onChange={(event) => updatePet({ insurance: event.target.value })} placeholder="Optional" /></label>
        </div>
      </section>

      <section className="dog-card dog-daily-card">
        <div className="section-heading"><span className="eyebrow">Daily care</span><h2>Today’s checklist</h2></div>
        <div className="dog-task-list">
          {dogDailyTasks.map((task) => {
            const Icon = task.icon
            const done = isDoneToday(pet, todayKey, task.id)
            return <button className={done ? 'dog-task done' : 'dog-task'} type="button" key={task.id} onClick={() => toggleTask(task.id)}><Icon size={20} /><span><strong>{task.label}</strong><small>{task.detail}</small></span>{done ? <CheckCircle2 size={20} /> : <Plus size={20} />}</button>
          })}
        </div>
      </section>

      <section className="dog-card dog-food-card">
        <div className="section-heading"><span className="eyebrow">Food</span><h2>Food type & feeding plan</h2></div>
        <div className="dog-form-grid">
          <label><span>Food brand</span><input value={pet.foodBrand} onChange={(event) => updatePet({ foodBrand: event.target.value })} placeholder="Brand name" /></label>
          <label><span>Food type</span><input value={pet.foodType} onChange={(event) => updatePet({ foodType: event.target.value })} placeholder="Kibble, wet, fresh, mix" /></label>
          <label><span>Amount</span><input value={pet.feedingAmount} onChange={(event) => updatePet({ feedingAmount: event.target.value })} placeholder="Example: 1 cup twice daily" /></label>
          <label><span>Schedule</span><input value={pet.feedingSchedule} onChange={(event) => updatePet({ feedingSchedule: event.target.value })} placeholder="Morning + evening" /></label>
          <label><span>Treats</span><input value={pet.treats} onChange={(event) => updatePet({ treats: event.target.value })} placeholder="Training treats, dental chews" /></label>
          <label><span>Allergies / avoid</span><input value={pet.allergies} onChange={(event) => updatePet({ allergies: event.target.value })} placeholder="Chicken, grains, etc." /></label>
        </div>
      </section>

      <section className="dog-card dog-exercise-card">
        <div className="section-heading"><span className="eyebrow">Exercise</span><h2>Walks & play</h2></div>
        <div className="dog-exercise-dashboard"><div><strong>{todayExercise.walks ?? 0}</strong><span>walks today</span></div><div><strong>{todayExercise.minutes ?? 0}</strong><span>minutes</span></div><div><strong>{walkGoal}</strong><span>minute goal</span></div></div>
        <form className="dog-walk-form" onSubmit={addWalk}><input type="number" min="1" value={walkMinutes} onChange={(event) => setWalkMinutes(event.target.value)} placeholder="Minutes walked" /><button className="primary-button" type="submit"><PawPrint size={17} />Log walk</button></form>
        <label className="dog-single-field"><span>Daily exercise goal</span><input value={pet.exerciseGoal} onChange={(event) => updatePet({ exerciseGoal: event.target.value })} placeholder="2 walks + play time" /></label>
        <label className="dog-single-field"><span>Walk minutes goal</span><input type="number" min="1" value={pet.walkMinutesGoal} onChange={(event) => updatePet({ walkMinutesGoal: event.target.value })} /></label>
      </section>

      <section className="dog-card dog-weight-card">
        <div className="section-heading"><span className="eyebrow">Growth</span><h2>Weight & size history</h2></div>
        <form className="dog-walk-form" onSubmit={saveWeight}><input value={newWeight} onChange={(event) => setNewWeight(event.target.value)} placeholder="Example: 45 lb" /><input value={newWeightNote} onChange={(event) => setNewWeightNote(event.target.value)} placeholder="Optional note" /><button className="primary-button" type="submit"><Weight size={17} />Log</button></form>
        <div className="dog-history-list">{pet.weightHistory?.length ? pet.weightHistory.map((item) => <article key={item.id}><strong>{item.weight}</strong><span>{item.date}</span><small>{item.note}</small></article>) : <p className="helper-copy">No weigh-ins yet.</p>}</div>
      </section>

      <section className="dog-card dog-appointment-card">
        <div className="section-heading"><span className="eyebrow">Appointments</span><h2>Upcoming & history</h2></div>
        <form className="dog-vaccine-form" onSubmit={saveAppointment}><input value={newAppointment.title} onChange={(event) => setNewAppointment((current) => ({ ...current, title: event.target.value }))} placeholder="Vet visit, groomer, training" /><input type="date" value={newAppointment.date} onChange={(event) => setNewAppointment((current) => ({ ...current, date: event.target.value }))} /><input value={newAppointment.type} onChange={(event) => setNewAppointment((current) => ({ ...current, type: event.target.value }))} placeholder="Type" /><input value={newAppointment.provider} onChange={(event) => setNewAppointment((current) => ({ ...current, provider: event.target.value }))} placeholder="Provider" /><button className="primary-button" type="submit"><CalendarDays size={17} />Add</button></form>
        <div className="dog-reminder-list">{upcomingAppointments.length ? upcomingAppointments.map((appt) => <article className={appt.completed ? 'dog-reminder done' : 'dog-reminder'} key={appt.id}><CalendarDays size={20} /><div><h3>{appt.title}</h3><p>{appt.provider || appt.type} · {appt.date || 'date not set'}</p><span>{appt.completed ? 'Completed' : getDueStatus(appt.date).label}</span></div><div className="dog-reminder-actions"><button className="secondary-button" type="button" onClick={() => toggleAppointment(appt.id)}><CheckCircle2 size={16} />{appt.completed ? 'Undo' : 'Done'}</button><button className="icon-toggle danger" type="button" onClick={() => deleteAppointment(appt.id)}><Trash2 size={16} /></button></div></article>) : <p className="helper-copy">No appointments logged yet.</p>}</div>
      </section>

      <section className="dog-card dog-vaccine-card">
        <div className="section-heading"><span className="eyebrow">Shot record</span><h2>Vaccines & medical</h2></div>
        <form className="dog-vaccine-form" onSubmit={saveVaccine}><input value={newVaccine.name} onChange={(event) => setNewVaccine((current) => ({ ...current, name: event.target.value }))} placeholder="Vaccine / medicine" /><input type="date" value={newVaccine.dateGiven} onChange={(event) => setNewVaccine((current) => ({ ...current, dateGiven: event.target.value }))} /><input type="date" value={newVaccine.nextDue} onChange={(event) => setNewVaccine((current) => ({ ...current, nextDue: event.target.value }))} /><input value={newVaccine.vet} onChange={(event) => setNewVaccine((current) => ({ ...current, vet: event.target.value }))} placeholder="Vet / clinic" /><button className="primary-button" type="submit"><Syringe size={17} />Add</button></form>
        <div className="dog-vaccine-list">{upcomingVaccines.map((vaccine) => { const status = getDueStatus(vaccine.nextDue); return <article className={`dog-vaccine due-${status.tone}`} key={vaccine.id}><ShieldCheck size={20} /><div><input value={vaccine.name} onChange={(event) => updateVaccine(vaccine.id, { name: event.target.value })} placeholder="Vaccine" /><small>Given: {vaccine.dateGiven || 'not logged'} · {status.label}</small><input value={vaccine.notes} onChange={(event) => updateVaccine(vaccine.id, { notes: event.target.value })} placeholder="Notes" /></div><button className="icon-toggle danger" type="button" onClick={() => deleteVaccine(vaccine.id)}><Trash2 size={16} /></button></article> })}</div>
      </section>

      <section className="dog-card dog-reminder-card">
        <div className="section-heading"><span className="eyebrow">Repeating care</span><h2>Baths, meds, nails</h2></div>
        <div className="dog-bath-row"><div><strong>Last bath</strong><span>{latestBath?.date ?? 'Not logged'}</span></div><button className="primary-button" type="button" onClick={logBath}><Plus size={17} />Log bath today</button></div>
        <form className="dog-reminder-form" onSubmit={addReminder}><input value={newReminder.title} onChange={(event) => setNewReminder((current) => ({ ...current, title: event.target.value }))} placeholder="Example: Dog wash" /><select value={newReminder.cadence} onChange={(event) => setNewReminder((current) => ({ ...current, cadence: event.target.value }))}>{cadenceOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><input type="date" value={newReminder.nextDue} onChange={(event) => setNewReminder((current) => ({ ...current, nextDue: event.target.value }))} /><input value={newReminder.note} onChange={(event) => setNewReminder((current) => ({ ...current, note: event.target.value }))} placeholder="Optional note" /><button className="primary-button" type="submit"><Plus size={17} />Add</button></form>
        <div className="dog-reminder-list">{dueReminders.map((reminder) => { const status = getDueStatus(reminder.nextDue); return <article className={`dog-reminder due-${status.tone}`} key={reminder.id}><CalendarDays size={20} /><div><h3>{reminder.title}</h3><p>{reminder.note || cadenceOptions.find(([value]) => value === reminder.cadence)?.[1]}</p><span>{status.label}</span></div><div className="dog-reminder-actions"><button className="secondary-button" type="button" onClick={() => completeReminder(reminder)}><RefreshCcw size={16} />Done</button><button className="icon-toggle danger" type="button" onClick={() => deleteReminder(reminder.id)}><Trash2 size={16} /></button></div></article> })}</div>
      </section>

      <section className="dog-card dog-notes-card">
        <div className="section-heading"><span className="eyebrow">Notes</span><h2>Stuff to remember</h2></div>
        <textarea value={pet.notes} onChange={(event) => updatePet({ notes: event.target.value })} placeholder="Favorite food, commands, potty notes, behavior, medicine instructions, what the shelter/vet said..." />
        <div className="dog-love-note"><NotebookPen size={18} /> Add anything important here so new-dog chaos does not eat your brain.</div>
      </section>
    </div>
  )
}
