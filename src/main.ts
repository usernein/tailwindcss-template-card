import './index.css'
import { TailwindTemplateCard } from './elements/TailwindTemplateCard'
import { HassWindow } from './types/HassWindow'

declare let window: HassWindow

customElements.define('tailwindcss-template-card', TailwindTemplateCard)

window.customCards.push({
  type: 'tailwindcss-template-card',
  name: 'TailwindCSS Template Card',
  description: 'Write HTML with TailwindCSS styles',
  preview: true
})
