import { useCallback, useState } from 'react'
import { calcFromLabel, parseNaturalLanguage } from '../services/foodScannerV2'
import './NutritionScanner.css'

const confidenceMeta = {
  high: { label: 'High - exact data', tone: 'high' },
  medium: { label: 'Medium - known estimate', tone: 'medium' },
  low: { label: 'Low - rough guess', tone: 'low' },
}

function toLoggedEntry(result) {
  return {
    ...result,
    calories: parseInt(result.calories, 10) || 0,
    protein: parseFloat(result.protein) || 0,
    carbs: parseFloat(result.carbs) || 0,
    fat: parseFloat(result.fat) || 0,
  }
}

function ResultCard({ result, editing, onEditToggle, onChange, onLog }) {
  const meta = confidenceMeta[result.confidence] ?? confidenceMeta.low
  const fields = [
    ['name', 'Meal name', 'text'],
    ['calories', 'Calories', 'number'],
    ['protein', 'Protein g', 'number'],
    ['carbs', 'Carbs g', 'number'],
    ['fat', 'Fat g', 'number'],
  ]

  return (
    <article className="ns-result-card">
      <div className="ns-result-header">
        <div>
          <span className="ns-eyebrow">Estimate result</span>
          <h3>{result.name}</h3>
        </div>
        <span className={`ns-confidence ns-confidence-${meta.tone}`}>{meta.label}</span>
      </div>

      <div className="ns-macro-row">
        <Macro label="Calories" value={result.calories} />
        <Macro label="Protein" value={`${result.protein}g`} />
        <Macro label="Carbs" value={`${result.carbs}g`} />
        <Macro label="Fat" value={`${result.fat}g`} />
      </div>

      {result.source === 'estimated' && !editing && <p className="ns-hint">Estimated result. Edit before logging if the portion looks off.</p>}

      {editing && (
        <div className="ns-edit-grid">
          {fields.map(([key, label, type]) => (
            <label key={key} className="ns-field">
              <span>{label}</span>
              <input
                type={type}
                value={result[key] ?? ''}
                onChange={(event) => onChange({ ...result, [key]: event.target.value })}
              />
            </label>
          ))}
        </div>
      )}

      <div className="ns-result-actions">
        <button className="ns-button ns-button-ghost" type="button" onClick={onEditToggle}>{editing ? 'Done editing' : 'Edit'}</button>
        <button className="ns-button ns-button-primary" type="button" onClick={() => onLog(toLoggedEntry(result))}>Log meal</button>
      </div>
    </article>
  )
}

function Macro({ label, value }) {
  return (
    <div className="ns-macro-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function DescribeTab({ onLog }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [editing, setEditing] = useState(false)

  const estimate = useCallback(() => {
    const next = parseNaturalLanguage(input)
    if (!next) return
    setResult(next)
    setEditing(false)
  }, [input])

  function log(resultToLog) {
    onLog(resultToLog)
    setInput('')
    setResult(null)
    setEditing(false)
  }

  return (
    <div className="ns-tab-content">
      <p className="ns-tab-desc">Tell the app what you ate. Add amounts when you know them.</p>
      <div className="ns-input-row">
        <textarea
          className="ns-textarea"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={'Example: 2 eggs and toast\nExample: 8 oz chicken breast and 1 cup rice\nExample: 600 calories 45g protein 60g carbs 18g fat'}
        />
        <button className="ns-button ns-button-primary ns-estimate-button" type="button" disabled={!input.trim()} onClick={estimate}>Estimate</button>
      </div>
      {result && <ResultCard result={result} editing={editing} onEditToggle={() => setEditing((value) => !value)} onChange={setResult} onLog={log} />}
    </div>
  )
}

function LabelTab({ onLog }) {
  const empty = { servingSize: '', servings: 1, calories: '', protein: '', carbs: '', fat: '' }
  const [form, setForm] = useState(empty)
  const [result, setResult] = useState(null)
  const [editing, setEditing] = useState(false)

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function calculate() {
    setResult(calcFromLabel(form))
    setEditing(false)
  }

  function log(resultToLog) {
    onLog(resultToLog)
    setForm(empty)
    setResult(null)
    setEditing(false)
  }

  return (
    <div className="ns-tab-content">
      <p className="ns-tab-desc">Copy the nutrition label and servings eaten. The app multiplies the totals.</p>
      <div className="ns-label-grid">
        <label className="ns-field ns-field-wide"><span>Serving size</span><input value={form.servingSize} onChange={(event) => update('servingSize', event.target.value)} placeholder="1 cup or 1 bar" /></label>
        <label className="ns-field"><span>Servings eaten</span><input type="number" min="0.25" step="0.25" value={form.servings} onChange={(event) => update('servings', event.target.value)} /></label>
        <label className="ns-field"><span>Calories / serving</span><input type="number" value={form.calories} onChange={(event) => update('calories', event.target.value)} /></label>
        <label className="ns-field"><span>Protein / serving</span><input type="number" value={form.protein} onChange={(event) => update('protein', event.target.value)} /></label>
        <label className="ns-field"><span>Carbs / serving</span><input type="number" value={form.carbs} onChange={(event) => update('carbs', event.target.value)} /></label>
        <label className="ns-field"><span>Fat / serving</span><input type="number" value={form.fat} onChange={(event) => update('fat', event.target.value)} /></label>
      </div>
      <button className="ns-button ns-button-primary" type="button" disabled={!form.calories} onClick={calculate}>Calculate totals</button>
      {result && <ResultCard result={result} editing={editing} onEditToggle={() => setEditing((value) => !value)} onChange={setResult} onLog={log} />}
    </div>
  )
}

function ScanTab() {
  const [active, setActive] = useState(null)
  const options = [
    ['photo', 'Scan food photo', 'AI estimates macros from a meal photo.'],
    ['label', 'Scan nutrition label', 'Camera reads the nutrition facts label.'],
    ['barcode', 'Scan barcode', 'Packaged food lookup by barcode.'],
  ]

  return (
    <div className="ns-tab-content">
      <p className="ns-tab-desc">Coming soon. This is ready for a real API later.</p>
      <div className="ns-scan-options">
        {options.map(([id, label, description]) => (
          <button key={id} className={active === id ? 'ns-scan-card ns-scan-active' : 'ns-scan-card'} type="button" onClick={() => setActive(id)}>
            <strong>{label}</strong>
            <span>{description}</span>
          </button>
        ))}
      </div>
      {active && <div className="ns-coming-soon"><strong>Scanner placeholder</strong><p>No API key is required yet. We can plug in OpenAI Vision, Google Vision, or Open Food Facts later.</p></div>}
    </div>
  )
}

const tabs = [
  ['describe', 'Describe'],
  ['label', 'Label'],
  ['scan', 'Scan'],
]

export default function NutritionScanner({ onLog }) {
  const [tab, setTab] = useState('describe')
  return (
    <section className="ns-root">
      <div className="ns-tab-bar">
        {tabs.map(([id, label]) => <button key={id} className={tab === id ? 'ns-tab-button active' : 'ns-tab-button'} type="button" onClick={() => setTab(id)}>{label}</button>)}
      </div>
      {tab === 'describe' && <DescribeTab onLog={onLog} />}
      {tab === 'label' && <LabelTab onLog={onLog} />}
      {tab === 'scan' && <ScanTab />}
    </section>
  )
}
