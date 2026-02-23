/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Nossa Paleta Personalizada
        racing: {
          black: '#0f0f0f',    // Fundo Principal
          dark: '#18181b',     // Cards / Menus
          red: '#dc2626',      // Vermelho Potente (Botões/Destaques)
          redHover: '#b91c1c', // Vermelho mais escuro (Hover)
          gray: '#a1a1aa',     // Texto secundário
          white: '#f4f4f5',    // Texto principal
        }
      },
      fontFamily: {
        // Se quiser importar uma fonte "rápida" depois (ex: Montserrat ou Roboto)
        sans: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}