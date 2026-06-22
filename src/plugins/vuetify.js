import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { initialThemeName } from '@/composables/useTheme.js'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: initialThemeName(),
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#42A5F5',
          secondary: '#90CAF9',
          accent: '#82B1FF',
          error: '#FF8A80',
          background: '#121212',
          surface: '#1E1E1E',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VCombobox: { variant: 'outlined', density: 'comfortable' },
  },
  icons: { defaultSet: 'mdi' },
})
