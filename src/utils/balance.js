const eurFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
})

export function centsFromEuros(euros) {
  return Math.round(Number(euros) * 100)
}

export function formatCents(cents) {
  return eurFormatter.format((cents ?? 0) / 100)
}

export function hasBalance(card) {
  return card?.balanceCents != null
}

export function balanceGroup(card) {
  if (!hasBalance(card)) return 'loyalty'
  return card.balanceCents === 0 ? 'empty' : 'active'
}

export function matchesBalanceFilter(card, filter) {
  if (filter === 'all') return true
  return balanceGroup(card) === filter
}

export function subtractCents(currentCents, spentCents) {
  return Math.max(0, currentCents - spentCents)
}

export function consumedRatio(card) {
  const initial = card?.initialBalanceCents
  if (!initial || initial <= 0) return 0
  const spent = 1 - card.balanceCents / initial
  return Math.min(1, Math.max(0, spent))
}
