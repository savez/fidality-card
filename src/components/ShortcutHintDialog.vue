<script setup>
import { ref } from 'vue'

const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, default: 'Aggiungi scorciatoia in home' },
})
const emit = defineEmits(['close'])

const copied = ref(false)

async function copyLink() {
  await navigator.clipboard.writeText(props.url)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <v-dialog model-value="true" max-width="480" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>{{ title }}</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="emit('close')" />
      </v-card-title>

      <v-card-text>
        <v-textarea readonly :model-value="url" rows="2" class="mb-2" />
        <v-btn block color="primary" prepend-icon="mdi-content-copy" class="mb-4" @click="copyLink">
          {{ copied ? 'Copiato!' : 'Copia link' }}
        </v-btn>
        <ol class="steps">
          <li>Apri il link copiato in Safari (iPhone) o Chrome (Android).</li>
          <li>
            Tocca
            <strong>Condividi</strong>
            (iPhone) o il menu ⋮ (Android), poi
            <strong>"Aggiungi alla schermata Home".</strong>
          </li>
          <li>Rinomina l'icona come preferisci e conferma.</li>
        </ol>
        <p class="text-caption text-medium-emphasis mt-3 mb-0">
          Su Android, se l'app è già installata, puoi anche tenere premuta la sua icona in home per
          trovare le scorciatoie rapide nel menu. Se invece l'icona appena creata apre la lista
          delle carte anziché questa direttamente, riprova aggiungendola dal browser (non dall'app
          già installata).
        </p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.steps {
  padding-left: 20px;
  margin: 0;
}
.steps li {
  margin-bottom: 8px;
}
</style>
