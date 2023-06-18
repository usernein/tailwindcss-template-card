import './index.css'
import './types/index.d.ts'
import { TailwindTemplateCard } from './elements/TailwindTemplateCard'
import { TailwindTemplateCardConfig } from './elements/TailwindTemplateCardConfig.tsx'

customElements.define('tailwindcss-template-card', TailwindTemplateCard)
customElements.define('tailwindcss-template-card-config', TailwindTemplateCardConfig)

window.customCards.push({
  type: 'tailwindcss-template-card',
  name: 'TailwindCSS Template Card',
  description: 'Write HTML with TailwindCSS styles',
  preview: true
})
