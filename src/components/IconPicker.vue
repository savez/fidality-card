<script setup>
import { ref, computed, watch } from 'vue'
import { CATEGORY_ORDER, iconsByCategory } from '@/icons/curated.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  modelValue: { type: String, default: undefined },
})
const emit = defineEmits(['update:open', 'update:modelValue'])

const tab = ref('categorie')
const emojiInput = ref('')
const customInput = ref('')

const categories = CATEGORY_ORDER
const groupedIcons = computed(() => iconsByCategory())

// Reset stati al chiudere
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      tab.value = 'categorie'
      emojiInput.value = ''
      customInput.value = ''
    }
  }
)

function close() {
  emit('update:open', false)
}

function pickValue(value) {
  // value può essere: 'mdi-xxx' | emoji char | undefined (= default brand)
  emit('update:modelValue', value)
  close()
}

function onPickCategorie(id) {
  pickValue(id)
}

function onPickEmoji() {
  const v = emojiInput.value.trim()
  if (!v) return
  pickValue(v)
}

function onPickCustom() {
  const raw = customInput.value.trim()
  if (!raw) return
  const id = raw.startsWith('mdi-') ? raw : `mdi-${raw}`
  pickValue(id)
}

function onPickDefault() {
  pickValue(undefined)
}
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="600"
    fullscreen-on-mobile
    scrollable
    @update:model-value="$emit('update:open', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Scegli icona</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" aria-label="Chiudi" @click="close" />
      </v-card-title>

      <v-tabs v-model="tab" grow>
        <v-tab value="categorie">Categorie</v-tab>
        <v-tab value="emoji">Emoji</v-tab>
        <v-tab value="custom">Custom</v-tab>
      </v-tabs>

      <v-card-text class="picker-body">
        <v-window v-model="tab">
          <v-window-item value="categorie">
            <div v-for="cat in categories" :key="cat" class="mb-4">
              <div class="text-overline mb-2">{{ cat }}</div>
              <div class="icon-grid">
                <button
                  v-for="ico in groupedIcons[cat]"
                  :key="ico.id"
                  class="icon-cell"
                  :class="{ selected: ico.id === modelValue }"
                  type="button"
                  :aria-label="ico.label"
                  :title="ico.label"
                  @click="onPickCategorie(ico.id)"
                >
                  <v-icon size="28">{{ ico.id }}</v-icon>
                </button>
              </div>
            </div>
          </v-window-item>

          <v-window-item value="emoji">
            <v-text-field
              v-model="emojiInput"
              label="Emoji"
              hint="Su mobile: long-press space per emoji keyboard. Su desktop: incolla un emoji."
              persistent-hint
              maxlength="8"
              autofocus
            />
            <div v-if="emojiInput" class="emoji-preview my-3">
              {{ emojiInput }}
            </div>
            <v-btn
              block
              color="primary"
              :disabled="!emojiInput.trim()"
              class="mt-2"
              @click="onPickEmoji"
            >
              Usa questa emoji
            </v-btn>
          </v-window-item>

          <v-window-item value="custom">
            <v-text-field
              v-model="customInput"
              prefix="mdi-"
              label="Nome icona Material"
              hint="Es. cart-outline, gas-station, train. Browse: pictogrammers.com/library/mdi"
              persistent-hint
              maxlength="60"
            />
            <div class="d-flex align-center ga-3 my-3">
              <v-icon size="40">mdi-{{ customInput.replace(/^mdi-/, '') || 'tag' }}</v-icon>
              <span class="text-caption text-medium-emphasis">Preview</span>
            </div>
            <a
              href="https://pictogrammers.com/library/mdi/"
              target="_blank"
              rel="noopener"
              class="text-caption d-block mb-3"
            >
              Esplora il catalogo MDI ↗
            </a>
            <v-btn block color="primary" :disabled="!customInput.trim()" @click="onPickCustom">
              Usa questa icona
            </v-btn>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-btn variant="text" prepend-icon="mdi-restore" @click="onPickDefault">
          Default del brand
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close">Annulla</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.picker-body {
  max-height: 60vh;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}
@media (max-width: 480px) {
  .icon-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
.icon-cell {
  aspect-ratio: 1;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border: 2px solid transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.12s ease;
}
.icon-cell:hover {
  background: rgba(var(--v-theme-on-surface), 0.12);
}
.icon-cell.selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
}
.emoji-preview {
  font-size: 48px;
  text-align: center;
  line-height: 1;
}
</style>
