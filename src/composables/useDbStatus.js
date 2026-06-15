import { ref } from 'vue'
import { probeDb } from '@/db/index.js'

const dbError = ref(null)
let probed = false

export async function initDbStatus() {
  if (probed) return
  probed = true
  dbError.value = await probeDb()
}

export function useDbStatus() {
  return { dbError }
}
