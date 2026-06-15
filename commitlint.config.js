export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Permettiamo subject in italiano: la regola lowercase su tutta la frase sarebbe troppo rigida
    'subject-case': [0],
    // Lunghezza header un po' più generosa
    'header-max-length': [2, 'always', 120],
  },
}
