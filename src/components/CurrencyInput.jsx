import { input } from '../styles/ui'

function CurrencyInput({ id, value, onChange, min = 0, step = 100 }) {
  return (
    <div className="mt-1 flex overflow-hidden rounded-lg border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <span className="flex shrink-0 items-center border-r border-border bg-canvas px-3 text-sm font-medium text-muted">
        $
      </span>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={onChange}
        className={`${input} rounded-none border-0 focus:ring-0`}
      />
    </div>
  )
}

export default CurrencyInput
