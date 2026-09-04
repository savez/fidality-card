export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Permettiamo subject in italiano: la regola lowercase su tutta la frase sarebbe troppo rigida
    'subject-case': [0],
    // Lunghezza header un po' più generosa
    'header-max-length': [2, 'always', 120],
    // Disattivata: i body autogenerati da Dependabot (righe `dependency-type:`,
    // link ai changelog) sforano sempre i 100 caratteri di config-conventional,
    // e con essi ogni commit che contiene un URL lungo. Il limite sul body non
    // aggiunge leggibilità, rende solo rosse PR per il resto valide.
    'body-max-line-length': [0],
  },
}
