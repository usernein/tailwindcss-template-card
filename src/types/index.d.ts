import { HomeAssistant } from "custom-card-helpers";

declare global {
  interface Window {
    hass: HomeAssistant
    customCards: CustomCard[]
  }
}

export type Binding = {
  bind: string
  selector: string
  type: string
}

export type BindAction = {
  call: boolean
  selector: string
  type: string
}