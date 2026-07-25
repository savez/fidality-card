import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { evaluateEligibility, dismiss, usePwaInstall } from '@/composables/usePwaInstall.js'

const DISMISSED_KEY = 'fidality-card:pwa-install-dismissed-at'
const INSTALLED_KEY = 'fidality-card:pwa-install-installed'
const DAY_MS = 24 * 60 * 60 * 1000

function stubMatchMedia(matches) {
  vi.stubGlobal('matchMedia', (q) => ({
    matches,
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }))
}

function stubNavigator({
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  standalone = false,
  navigatorPlatform = 'Win32',
  maxTouchPoints = 0,
} = {}) {
  vi.stubGlobal('navigator', { userAgent, standalone, platform: navigatorPlatform, maxTouchPoints })
}

describe('evaluateEligibility', () => {
  const { platform } = usePwaInstall()

  beforeEach(() => {
    localStorage.clear()
    stubMatchMedia(false)
    stubNavigator()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('false se già in standalone (display-mode)', () => {
    stubMatchMedia(true)
    expect(evaluateEligibility()).toBe(false)
  })

  it('false se già in standalone (navigator.standalone)', () => {
    stubNavigator({ standalone: true })
    expect(evaluateEligibility()).toBe(false)
  })

  it('false se il flag "installed" è permanente', () => {
    stubNavigator({ userAgent: 'iPhone' })
    localStorage.setItem(INSTALLED_KEY, 'true')
    expect(evaluateEligibility()).toBe(false)
  })

  it('false se lo snooze è recente (< 14 giorni)', () => {
    stubNavigator({ userAgent: 'iPhone' })
    localStorage.setItem(DISMISSED_KEY, String(Date.now() - 1 * DAY_MS))
    expect(evaluateEligibility()).toBe(false)
  })

  it('true e platform "ios" se lo snooze è scaduto (> 14 giorni)', () => {
    stubNavigator({ userAgent: 'iPhone' })
    localStorage.setItem(DISMISSED_KEY, String(Date.now() - 15 * DAY_MS))
    expect(evaluateEligibility()).toBe(true)
    expect(platform.value).toBe('ios')
  })

  it('true e platform "ios" su iPad/iPhone/iPod senza snooze attivo', () => {
    stubNavigator({ userAgent: 'iPad' })
    expect(evaluateEligibility()).toBe(true)
    expect(platform.value).toBe('ios')
  })

  it('true e platform "ios" su iPad moderno (UA "Macintosh" + maxTouchPoints)', () => {
    // iPadOS 13+ riporta userAgent "Macintosh" per default (desktop-class Safari);
    // si distingue da un vero Mac tramite platform "MacIntel" + touch screen.
    stubNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15',
      navigatorPlatform: 'MacIntel',
      maxTouchPoints: 5,
    })
    expect(evaluateEligibility()).toBe(true)
    expect(platform.value).toBe('ios')
  })

  it('false su vero Mac desktop (MacIntel senza touch)', () => {
    stubNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15',
      navigatorPlatform: 'MacIntel',
      maxTouchPoints: 0,
    })
    expect(evaluateEligibility()).toBe(false)
  })

  it('false su desktop non-iOS senza deferredPrompt disponibile', () => {
    stubNavigator({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })
    expect(evaluateEligibility()).toBe(false)
  })
})

describe('dismiss', () => {
  beforeEach(() => localStorage.clear())

  it('scrive il timestamp corrente nella chiave di snooze', () => {
    const before = Date.now()
    dismiss()
    const stored = Number(localStorage.getItem(DISMISSED_KEY))
    expect(stored).toBeGreaterThanOrEqual(before)
    expect(stored).toBeLessThanOrEqual(Date.now())
  })
})
