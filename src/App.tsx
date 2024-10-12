import { Icon, NumberInput } from '@ootidea/solidjs-modular-components'
import { isInstanceOf, sequentialNumbersUntil } from 'base-up'
import { createMemo } from 'solid-js'
import classes from './App.module.scss'
import { CssColorOutput } from './CssColorOutput'
import { Triangle } from './Triangle'
import { createColorByChromaRatio, ease, toHsl } from './color'
import heartOutlineIcon from './image/heart-outline.svg'
import heartIcon from './image/heart.svg'
import helpCircleIcon from './image/help-circle-outline.svg'
import starOutlineIcon from './image/star-outline.svg'
import starIcon from './image/star.svg'
import thumbUpOutlineIcon from './image/thumb-up-outline.svg'
import thumbUpIcon from './image/thumb-up.svg'
import { MAX_NUMBER_INPUT_LENGTH, chromaRatio, hue, lightness, setChromaRatio, setHue, setLightness } from './signal'

const easedLightness = createMemo(() => ease(lightness()))
const color = createMemo(() => createColorByChromaRatio(easedLightness(), chromaRatio(), hue()))

export function App() {
  const SLIDER_SIZE_PX = 360

  const onMouseDownOf =
    (setter: (value: number) => void, maxValue = 1) =>
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
          <legend>Color Input</legend>

          <div class={classes.inputGrid}>
            <div style={{ display: 'flex', gap: '0.2em', 'align-items': 'center' }}>
              Lightness
              <Icon
                src={helpCircleIcon}
                size="0.75lh"
                color="oklch(60% 0 0)"
                title={
                  'Instead of the original lightness value in Oklch, it represents a corrected value that is closer to the lightness in HSL.\nSpecifically, by raising this value to the power of 0.74, you will get the lightness value in Oklch.'
                }
              />
            </div>
            <div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${lightness() * 100}%` }}>
                <Triangle direction="down" />
              </div>
              <div class={classes.sliderTrack} onMouseDown={onMouseDownOf(setLightness)}>
                {sequentialNumbersUntil(SLIDER_SIZE_PX as number).map((index) => (
                  <div style={{ background: toHsl(ease(index / (SLIDER_SIZE_PX - 1)), chromaRatio(), hue()) }} />
                ))}
              </div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${lightness() * 100}%` }}>
                <Triangle />
              </div>
            </div>
            <NumberInput nonNegative value={lightness()} maxLength={MAX_NUMBER_INPUT_LENGTH} onChange={setLightness} />

            <div style={{ display: 'flex', gap: '0.2em', 'align-items': 'center' }}>
              Chroma
              <Icon
                src={helpCircleIcon}
                size="0.75lh"
                color="oklch(60% 0 0)"
                title={
                  'Instead of the original chroma value in Oklch, it represents the ratio of the maximum chroma within the sRGB color gamut.\nThe maximum chroma is determined by lightness and hue.'
                }
              />
            </div>
            <div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${chromaRatio() * 100}%` }}>
                <Triangle direction="down" />
              </div>
              <div class={classes.sliderTrack} onMouseDown={onMouseDownOf(setChromaRatio)}>
                {sequentialNumbersUntil(SLIDER_SIZE_PX as number).map((index) => (
                  <div style={{ background: toHsl(easedLightness(), index / (SLIDER_SIZE_PX - 1), hue()) }} />
                ))}
              </div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${chromaRatio() * 100}%` }}>
                <Triangle />
              </div>
            </div>
            <NumberInput nonNegative value={chromaRatio()} maxLength={MAX_NUMBER_INPUT_LENGTH} onChange={setChromaRatio} />

            <div>Hue</div>
            <div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${(hue() / 360) * 100}%` }}>
                <Triangle direction="down" />
              </div>
              <div class={classes.sliderTrack} onMouseDown={onMouseDownOf(setHue, 360)}>
                {sequentialNumbersUntil(SLIDER_SIZE_PX as number).map((index) => (
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
            <NumberInput nonNegative integer value={hue()} maxLength={MAX_NUMBER_INPUT_LENGTH} onChange={setHue} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Color Preview</legend>

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
          <legend>CSS Colors</legend>

          <div style={{ display: 'grid', gap: '0.4em' }}>
            <CssColorOutput color={color().to('srgb').toString({ format: 'hex' })} />
            <CssColorOutput color={color().to('srgb').toString()} />
            <CssColorOutput color={color().to('hsl').toString()} />
            <CssColorOutput color={color().toString()} />
            <CssColorOutput color={color().to('oklab').toString()} />
            <CssColorOutput color={color().to('lch').toString()} />
            <CssColorOutput color={color().to('lab').toString()} />
          </div>
        </fieldset>
      </div>
    </main>
  )
}
