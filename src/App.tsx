import { clamp, isInstanceOf, rangeUntil } from 'base-up'
import Color from 'colorjs.io'
import { Gravity, Icon, IconButton, NumberInput, Popover, TextInput, Triangle } from 'solid-design-parts'
import { batch, createMemo, createSignal } from 'solid-js'
import classes from './App.module.scss'
import { calculateMaxChromaInGamut, createColorByChromaRatio, toHsl } from './color'
import heartOutlineIcon from './heart-outline.svg'
import heartIcon from './heart.svg'
import helpCircleIcon from './help-circle-outline.svg'
import starOutlineIcon from './star-outline.svg'
import starIcon from './star.svg'
import thumbUpOutlineIcon from './thumb-up-outline.svg'
import thumbUpIcon from './thumb-up.svg'

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

function isInvalidColorString(colorString: string): boolean {
  try {
    new Color(colorString)
  } catch {
    return true
  }
  return false
}

function onInput(event: Event) {
  if (!isInstanceOf(event.target, HTMLInputElement)) return

  const colorString = event.target.value
  if (isInvalidColorString(colorString)) return

  const oklch = new Color(colorString).to('oklch')
  const lightness = oklch.get('l')
  const chroma = oklch.get('c')
  const hue = oklch.get('h')
  batch(() => {
    setLightness(unease(lightness))
    setChromaRatio(chroma / calculateMaxChromaInGamut(lightness, hue))
    setHue(hue)
  })
}

/** Easing function for lightness */
function ease(x: number): number {
  return Math.pow(x, 0.74)
}
function unease(x: number): number {
  return Math.pow(x, 1 / 0.74)
}

const [hue, setHue] = createHueSignal()
const [chromaRatio, setChromaRatio] = createChromaRatioSignal()
const [lightness, setLightness] = createLightnessSignal()
const easedLightness = createMemo(() => ease(lightness()))
const color = createMemo(() => createColorByChromaRatio(easedLightness(), chromaRatio(), hue()))

export function App() {
  const SLIDER_SIZE_PX = 360

  const onMouseDown =
    (setter: (value: number) => void, maxValue: number = 1) =>
    (event: MouseEvent) => {
      event.preventDefault()

      if (!isInstanceOf(event.currentTarget, HTMLElement)) return

      const mouseX = event.clientX
      const elementX = Math.floor(event.currentTarget.getBoundingClientRect().x)
      const ratio = (mouseX - elementX) / SLIDER_SIZE_PX
      setter(maxValue * ratio)

      document.body.addEventListener('mousemove', onMouseMove)

      function onMouseMove(event: MouseEvent) {
        // if left-mouse-button is not pressed
        if ((event.buttons & 1) === 0) {
          document.body.removeEventListener('mousemove', onMouseMove)
          return
        }

        const mouseX = event.clientX
        setter((mouseX - elementX) * (maxValue / SLIDER_SIZE_PX))
      }
    }

  return (
    <main style={{ display: 'flex', 'justify-content': 'center', '--currentColor': color().to('hsl').toString() }}>
      <div>
        <h1 style={{ 'text-align': 'center' }}>Oklch color picker</h1>

        <fieldset>
          <legend>Input</legend>

          <div class={classes.inputGrid}>
            <div style={{ display: 'flex', 'align-items': 'center' }}>
              Lightness
              <Popover
                launcher={({ openPopover }) => (
                  <Gravity>
                    <IconButton src={helpCircleIcon} size="1.5em" iconColor="oklch(60% 0 0)" onClick={openPopover} />
                  </Gravity>
                )}
              >
                <p style={{ margin: '1em', 'font-size': '0.9em' }}>
                  Instead of the original lightness value in Oklch, it represents a corrected value that is closer to
                  the lightness in HSL.
                  <br />
                  Specifically, by raising this value to the power of 0.74, you will get the lightness value in Oklch.
                </p>
              </Popover>
            </div>
            <div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${lightness() * 100}%` }}>
                <Triangle direction="down" />
              </div>
              <div class={classes.sliderTrack} onMouseDown={onMouseDown(setLightness)}>
                {rangeUntil(SLIDER_SIZE_PX as number).map((index) => (
                  <div style={{ background: toHsl(ease(index / (SLIDER_SIZE_PX - 1)), chromaRatio(), hue()) }} />
                ))}
              </div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${lightness() * 100}%` }}>
                <Triangle />
              </div>
            </div>
            <NumberInput
              value={lightness()}
              min={0}
              max={1}
              required
              onChangeValue={(value) => value !== undefined && setLightness(value)}
            />

            <div style={{ display: 'flex', 'align-items': 'center' }}>
              Chroma
              <Popover
                launcher={({ openPopover }) => (
                  <Gravity>
                    <IconButton src={helpCircleIcon} size="1.5em" iconColor="oklch(60% 0 0)" onClick={openPopover} />
                  </Gravity>
                )}
              >
                <p style={{ margin: '1em', 'font-size': '0.9em' }}>
                  Instead of the original chroma value in Oklch, it represents the ratio of the maximum chroma within
                  the sRGB color gamut. The maximum chroma is determined by lightness and hue.
                </p>
              </Popover>
            </div>
            <div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${chromaRatio() * 100}%` }}>
                <Triangle direction="down" />
              </div>
              <div class={classes.sliderTrack} onMouseDown={onMouseDown(setChromaRatio)}>
                {rangeUntil(SLIDER_SIZE_PX as number).map((index) => (
                  <div style={{ background: toHsl(easedLightness(), index / (SLIDER_SIZE_PX - 1), hue()) }} />
                ))}
              </div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${chromaRatio() * 100}%` }}>
                <Triangle />
              </div>
            </div>
            <NumberInput
              value={chromaRatio()}
              min={0}
              max={1}
              required
              onChangeValue={(value) => value !== undefined && setChromaRatio(value)}
            />

            <div>Hue</div>
            <div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${(hue() / 360) * 100}%` }}>
                <Triangle direction="down" />
              </div>
              <div class={classes.sliderTrack} onMouseDown={onMouseDown(setHue, 360)}>
                {rangeUntil(SLIDER_SIZE_PX as number).map((index) => (
                  <div
                    style={{
                      background: toHsl(easedLightness(), chromaRatio(), (360 * index) / (SLIDER_SIZE_PX - 1)),
                    }}
                  />
                ))}
              </div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${(hue() / 360) * 100}%` }}>
                <Triangle />
              </div>
            </div>
            <NumberInput
              value={hue()}
              min={0}
              max={360}
              required
              onChangeValue={(value) => value !== undefined && setHue(value)}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Preview</legend>

          <div style={{ display: 'flex', 'align-items': 'start', gap: '3em' }}>
            <div class={classes.previewSquare} />
            <div>
              <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'center', gap: '1em' }}>
                <div class={classes.previewWhiteText}>Sample</div>
                <div class={classes.previewBlackText}>Sample</div>
                <div class={classes.previewBorder}>Sample</div>
                <div class={classes.previewLink}>Sample</div>
              </div>
              <div
                style={{
                  'margin-top': '2em',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  gap: '1.5em',
                }}
              >
                <Icon src={heartOutlineIcon} color="var(--currentColor)" />
                <Icon src={starOutlineIcon} color="var(--currentColor)" />
                <Icon src={thumbUpOutlineIcon} color="var(--currentColor)" />
                <Icon src={heartIcon} color="var(--currentColor)" />
                <Icon src={starIcon} color="var(--currentColor)" />
                <Icon src={thumbUpIcon} color="var(--currentColor)" />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Output</legend>

          <div style={{ display: 'grid', gap: '0.1em', 'font-size': '0.9em' }}>
            <TextInput
              value={color().to('srgb').toString({ format: 'hex' })}
              error={isInvalidColorString}
              onInput={onInput}
            />
            <TextInput value={color().to('srgb').toString()} error={isInvalidColorString} onInput={onInput} />
            <TextInput value={color().to('hsl').toString()} error={isInvalidColorString} onInput={onInput} />
            <TextInput value={color().toString()} error={isInvalidColorString} onInput={onInput} />
            <TextInput value={color().to('oklab').toString()} error={isInvalidColorString} onInput={onInput} />
            <TextInput value={color().to('lch').toString()} error={isInvalidColorString} onInput={onInput} />
            <TextInput value={color().to('lab').toString()} error={isInvalidColorString} onInput={onInput} />
          </div>
        </fieldset>
      </div>
    </main>
  )
}
