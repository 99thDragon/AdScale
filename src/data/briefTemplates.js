const STORAGE_KEY = 'adscale.brief.templates'

/**
 * @typedef {{ id: string, name: string, goal: string, createdAt: string }} BriefTemplate
 */

/** @returns {BriefTemplate[]} */
export function loadBriefTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** @param {BriefTemplate[]} templates */
function persistTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

/**
 * @param {string} name
 * @param {string} goal
 * @returns {BriefTemplate}
 */
export function saveBriefTemplate(name, goal) {
  const templates = loadBriefTemplates()
  const template = {
    id: `tpl-${Date.now()}`,
    name: name.trim(),
    goal: goal.trim(),
    createdAt: new Date().toISOString(),
  }
  persistTemplates([template, ...templates])
  return template
}

/** @param {string} id */
export function deleteBriefTemplate(id) {
  persistTemplates(loadBriefTemplates().filter((t) => t.id !== id))
}
