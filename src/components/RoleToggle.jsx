const ROLES = [
  { id: 'manager', label: 'Ad Manager' },
  { id: 'lead', label: 'Marketing Lead' },
]

function RoleToggle({ role, onRoleChange }) {
  return (
    <div className="flex rounded-lg border border-border bg-surface p-1">
      {ROLES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onRoleChange(id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            role === id
              ? 'bg-primary text-white'
              : 'text-muted hover:bg-canvas hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default RoleToggle
