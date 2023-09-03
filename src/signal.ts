import { clamp } from 'base-up'
import { createSignal } from 'solid-js'

export const [hue, setHue] = createHueSignal()
export const [chromaRatio, setChromaRatio] = createChromaRatioSignal()
export const [lightness, setLightness] = createLightnessSignal()

function createHueSignal() {
  const [hue, setHue] = createSignal(180)
  return [hue, (newHue: number) => setHue(clamp(0, newHue, 360))] as const
}

function createChromaRatioSignal() {
  const [chromaRatio, setChromaRatio] = createSignal(0.8)
  return [chromaRatio, (newChromaRatio: number) => setChromaRatio(clamp(0, newChromaRatio, 1))] as const
}

function createLightnessSignal() {
  const [Lightness, setLightness] = createSignal(0.6)
  return [Lightness, (newLightness: number) => setLightness(clamp(0, newLightness, 1))] as const
}
