import { clamp } from 'base-up'
import { createSignal } from 'solid-js'

export const [hue, setHue] = createHueSignal()
export const [chromaRatio, setChromaRatio] = createChromaRatioSignal()
export const [lightness, setLightness] = createLightnessSignal()

export const MAX_NUMBER_INPUT_LENGTH = 6

function createHueSignal() {
  const [hue, setHue] = createSignal(180)
  return [
    hue,
    (newHue: number) => {
      if (Number.isNaN(newHue)) return

      setHue(clamp(0, restrictCharacterLength(newHue), 360))
    },
  ] as const
}

function createChromaRatioSignal() {
  const [chromaRatio, setChromaRatio] = createSignal(0.8)
  return [
    chromaRatio,
    (newChromaRatio: number) => {
      if (Number.isNaN(newChromaRatio)) return

      setChromaRatio(clamp(0, restrictCharacterLength(newChromaRatio), 1))
    },
  ] as const
}

function createLightnessSignal() {
  const [Lightness, setLightness] = createSignal(0.6)
  return [
    Lightness,
    (newLightness: number) => {
      if (Number.isNaN(newLightness)) return

      setLightness(clamp(0, restrictCharacterLength(newLightness), 1))
    },
  ] as const
}

function restrictCharacterLength(value: number) {
  return Number(`${value}`.slice(0, MAX_NUMBER_INPUT_LENGTH))
}
