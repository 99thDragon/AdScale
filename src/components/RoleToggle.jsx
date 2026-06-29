const ROLES = [
  { id: 'manager', label: 'Ad Manager' },
  { id: 'lead', label: 'Marketing Lead' },
]

function RoleToggle({ role, onRoleChange }) {
  return (
    <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      {ROLES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onRoleChange(id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            role === id
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default RoleToggle
