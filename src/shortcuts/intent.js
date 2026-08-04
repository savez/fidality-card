const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function parseIntent(search) {
  const params = new URLSearchParams(search)
  const open = params.get('open')
  if (!open) return null
  if (open === 'most-used') return { kind: 'most-used' }
  if (open === 'pinned') return { kind: 'pinned' }
  if (UUID_V4_RE.test(open)) return { kind: 'card', id: open.toLowerCase() }
  return null
}
