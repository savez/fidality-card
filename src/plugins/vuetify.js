import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { initialThemeName } from '@/composables/useTheme.js'

// Direzione "Pocket": utility iper-leggibile, accento indaco, angoli sobri.
export const vuetify = createVuetify({
  theme: {
    defaultTheme: initialThemeName(),
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#eef1f6',
          surface: '#ffffff',
          'surface-variant': '#e2e6ee',
          primary: '#4b43f2',
          secondary: '#14161a',
          error: '#e5484d',
          info: '#4b43f2',
          success: '#30a46c',
          warning: '#f5a623',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#0f1115',
          surface: '#181b21',
          'surface-variant': '#262a31',
          primary: '#6f68ff',
          secondary: '#eceef2',
          error: '#ff6369',
          info: '#6f68ff',
          success: '#3dd68c',
          warning: '#ffb224',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
    VSelect: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
    VCombobox: { variant: 'outlined', density: 'comfortable', rounded: 'lg' },
    VCard: { rounded: 'lg' },
  },
  icons: { defaultSet: 'mdi' },
})
