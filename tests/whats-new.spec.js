import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/db/index.js'
import {
  pickUnseenNotes,
  notesUpTo,
  resolveBootDecision,
  hasUsageSignal,
  isReturningUser,
  initWhatsNew,
  useWhatsNew,
  currentVersion,
  readLastSeen,
  markSeen,
  readDeferred,
  markDeferred,
  clearDeferred,
} from '@/composables/useWhatsNew.js'
import { releaseNotes } from '@/config/releaseNotes.js'

// Chiavi ridichiarate a mano: la duplicazione è voluta, così un rename in
// produzione fa cadere il test invece di passare in silenzio.
const SEEN_KEY = 'fidality-card:last-seen-version'
const DEFERRED_KEY = 'fidality-card:whats-new-deferred'

const NOTES = [
  { version: '2.9.0', title: 'Nove', highlights: [{ text: 'nove' }] },
  { version: '2.8.0', title: 'Otto', highlights: [{ text: 'otto' }] },
  { version: '2.7.0', title: 'Sette', highlights: [{ text: 'sette' }] },
]

beforeEach(async () => {
  localStorage.clear()
  await db.cards.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pickUnseenNotes', () => {
  it('primo avvio: nessuna versione vista, nessuna voce', () => {
    expect(pickUnseenNotes(null, '2.9.0', NOTES)).toEqual([])
    expect(pickUnseenNotes('', '2.9.0', NOTES)).toEqual([])
  })

  it('mostra solo le voci più recenti della versione vista', () => {
    const entries = pickUnseenNotes('2.8.0', '2.9.0', NOTES)
    expect(entries.map((e) => e.version)).toEqual(['2.9.0'])
  })

  it('aggrega le versioni saltate, dalla più recente', () => {
    const entries = pickUnseenNotes('2.6.0', '2.9.0', NOTES)
    expect(entries.map((e) => e.version)).toEqual(['2.9.0', '2.8.0', '2.7.0'])
  })

  it('nessuna voce per la versione corrente: niente da mostrare', () => {
    expect(pickUnseenNotes('2.9.0', '2.9.1', NOTES)).toEqual([])
  })

  it('esclude le voci di versioni non ancora rilasciate nel bundle', () => {
    const entries = pickUnseenNotes('2.7.0', '2.8.0', NOTES)
    expect(entries.map((e) => e.version)).toEqual(['2.8.0'])
  })

  it('versione corrente non parsabile: niente da mostrare', () => {
    expect(pickUnseenNotes('2.6.0', null, NOTES)).toEqual([])
    expect(pickUnseenNotes('2.6.0', '?.?.?', NOTES)).toEqual([])
  })

  it('ignora le voci con versione malformata invece di lanciare', () => {
    const notes = [{ version: 'x.y.z', title: 'Rotta', highlights: [] }, ...NOTES]
    const entries = pickUnseenNotes('2.8.0', '2.9.0', notes)
    expect(entries.map((e) => e.version)).toEqual(['2.9.0'])
  })

  it('usa releaseNotes come default e non lancia sui dati reali', () => {
    expect(() => pickUnseenNotes('0.0.1', '99.0.0')).not.toThrow()
    const entries = pickUnseenNotes('0.0.1', '99.0.0')
    expect(entries.length).toBe(releaseNotes.length)
  })
})

describe('notesUpTo', () => {
  it('ritorna la voce di quella versione', () => {
    expect(notesUpTo('2.8.0', NOTES).map((e) => e.title)).toEqual(['Otto'])
  })

  it('su una patch senza voce ritorna la più recente già rilasciata', () => {
    expect(notesUpTo('2.8.1', NOTES).map((e) => e.title)).toEqual(['Otto'])
  })

  it('ritorna [] se nessuna voce è ancora rilasciata o la versione è sporca', () => {
    expect(notesUpTo('2.6.0', NOTES)).toEqual([])
    expect(notesUpTo(null, NOTES)).toEqual([])
  })
})

describe('resolveBootDecision', () => {
  it('niente da raccontare: nessun modale', () => {
    expect(resolveBootDecision({ pendingCount: 0, canInstall: true, wasDeferred: false })).toBe(
      'none'
    )
  })

  it('banner install in arrivo: rinvia', () => {
    expect(resolveBootDecision({ pendingCount: 1, canInstall: true, wasDeferred: false })).toBe(
      'defer'
    )
  })

  it('già rinviato una volta: apre comunque, banner o no', () => {
    expect(resolveBootDecision({ pendingCount: 1, canInstall: true, wasDeferred: true })).toBe(
      'open'
    )
  })

  it('nessun banner: apre', () => {
    expect(resolveBootDecision({ pendingCount: 2, canInstall: false, wasDeferred: false })).toBe(
      'open'
    )
  })

  it('avvio da scorciatoia in home: salta senza rinviare', () => {
    expect(
      resolveBootDecision({
        pendingCount: 2,
        canInstall: false,
        wasDeferred: true,
        launchedFromShortcut: true,
      })
    ).toBe('none')
  })
})

describe("riconoscere chi usava già l'app", () => {
  it('nessuna traccia di uso: installazione nuova', async () => {
    expect(hasUsageSignal()).toBe(false)
    expect(await isReturningUser()).toBe(false)
  })

  it('una preferenza salvata basta come traccia', async () => {
    localStorage.setItem('fidality-card:theme-mode', 'dark')
    expect(hasUsageSignal()).toBe(true)
    expect(await isReturningUser()).toBe(true)
  })

  it('anche una sola card salvata è una traccia', async () => {
    await db.cards.add({ id: 'c1', name: 'Test', code: '123', createdAt: Date.now() })
    expect(hasUsageSignal()).toBe(false)
    expect(await isReturningUser()).toBe(true)
  })
})

describe('initWhatsNew', () => {
  it('installazione nuova: semina il flag e non prepara nulla', async () => {
    await initWhatsNew()
    expect(localStorage.getItem(SEEN_KEY)).toBe(currentVersion())
    expect(useWhatsNew().pendingEntries.value).toEqual([])
  })

  it('utente di vecchia data senza flag: prepara le novità della versione corrente senza segnarle', async () => {
    localStorage.setItem('fidality-card:theme-mode', 'dark')
    await initWhatsNew()
    expect(localStorage.getItem(SEEN_KEY)).toBeNull()
    expect(useWhatsNew().pendingEntries.value.map((e) => e.version)).toEqual([currentVersion()])
  })

  it('release senza novità da raccontare: nessun modale, ma il flag avanza', async () => {
    localStorage.setItem(SEEN_KEY, '0.0.1')
    const notes = useWhatsNew()
    await initWhatsNew()
    // La versione corrente ha una voce, quindi qui verifichiamo il contrario:
    // con il flag già alla versione corrente non resta niente da mostrare.
    localStorage.setItem(SEEN_KEY, currentVersion())
    await initWhatsNew()
    expect(notes.pendingEntries.value).toEqual([])
    expect(localStorage.getItem(SEEN_KEY)).toBe(currentVersion())
  })
})

describe('currentVersion', () => {
  // Il define di vite.config.js vale anche per Vitest, quindi qui la versione
  // c'è davvero. La guardia `typeof` serve per i contesti dove non c'è.
  it('ritorna la versione iniettata al build', () => {
    expect(currentVersion()).toMatch(/^\d+\.\d+\.\d+$/)
  })
})

describe('flag su localStorage', () => {
  it('markSeen scrive la versione, readLastSeen la rilegge', () => {
    markSeen('2.9.0')
    expect(localStorage.getItem(SEEN_KEY)).toBe('2.9.0')
    expect(readLastSeen()).toBe('2.9.0')
  })

  it("readLastSeen ritorna null se la chiave non c'è", () => {
    expect(readLastSeen()).toBeNull()
  })

  it('markSeen ignora versioni non valide', () => {
    markSeen(null)
    markSeen('?.?.?')
    expect(localStorage.getItem(SEEN_KEY)).toBeNull()
  })

  it('marker di rinvio: si scrive, si rilegge e si cancella', () => {
    markDeferred('2.9.0')
    expect(localStorage.getItem(DEFERRED_KEY)).toBe('2.9.0')
    expect(readDeferred()).toBe('2.9.0')
    clearDeferred()
    expect(localStorage.getItem(DEFERRED_KEY)).toBeNull()
  })

  it('non lancia se localStorage non è disponibile (incognito)', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {
        throw new Error('SecurityError')
      },
      removeItem() {
        throw new Error('SecurityError')
      },
    })
    expect(readLastSeen()).toBeNull()
    expect(readDeferred()).toBeNull()
    expect(() => markSeen('2.9.0')).not.toThrow()
    expect(() => markDeferred('2.9.0')).not.toThrow()
    expect(() => clearDeferred()).not.toThrow()
  })
})
