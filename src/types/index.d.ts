import { HomeAssistant } from "custom-card-helpers";

declare global {
  interface Window {
    hass: HomeAssistant
    customCards: CustomCard[]
  }
}