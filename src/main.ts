import './index.css'
import './types/index.d.ts'
import { TailwindTemplateCard } from './elements/TailwindTemplateCard'

customElements.define('tailwindcss-template-card', TailwindTemplateCard)

window.customCards.push({
  type: 'tailwindcss-template-card',
  name: 'TailwindCSS Template Card',
  description: 'Write HTML with TailwindCSS styles',
  preview: true
})
