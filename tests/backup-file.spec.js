import { describe, it, expect } from 'vitest'
import { backupFilename, buildBackupFile } from '@/share/backupFile.js'

describe('backupFilename', () => {
  it('formatta la data come fidelity-cards-YYYY-MM-DD.json', () => {
    expect(backupFilename(new Date('2026-06-22T10:00:00'))).toBe('fidelity-cards-2026-06-22.json')
  })

  it('zero-padding di mese e giorno', () => {
    expect(backupFilename(new Date('2026-01-05T00:00:00'))).toBe('fidelity-cards-2026-01-05.json')
  })

  it('estensione personalizzabile (es. txt per la condivisione)', () => {
    expect(backupFilename(new Date('2026-06-22T10:00:00'), 'txt')).toBe(
      'fidelity-cards-2026-06-22.txt'
    )
  })
})

describe('buildBackupFile', () => {
  const dump = { version: 1, exportedAt: 123, cards: [{ id: 'a', name: 'Test' }] }

  it('crea un File con nome e tipo application/json', () => {
    const file = buildBackupFile(dump, 'backup.json')
    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('backup.json')
    expect(file.type).toBe('application/json')
  })

  it('il contenuto è il dump serializzato in JSON pretty', async () => {
    const file = buildBackupFile(dump, 'backup.json')
    expect(await file.text()).toBe(JSON.stringify(dump, null, 2))
  })

  it('tipo MIME personalizzabile (text/plain per lo share su Android)', () => {
    const file = buildBackupFile(dump, 'backup.txt', 'text/plain')
    expect(file.type).toBe('text/plain')
    expect(file.name).toBe('backup.txt')
  })
})
