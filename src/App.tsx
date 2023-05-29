import { clamp, isInstanceOf, rangeUntil, roundAt } from 'base-up'
import { Gravity, IconButton, NumberInput, Popover, Triangle } from 'solid-design-parts'
import { createMemo, createSignal } from 'solid-js'
import classes from './App.module.scss'
import { createColorByChromaRatio, toHsl } from './color'
import helpCircleIcon from './help-circle-outline.svg'

function createHueSignal() {
  const [hue, setHue] = createSignal(240)
  return [hue, (newHue: number) => setHue(roundAt(clamp(0, newHue, 360), 1))] as const
}

function createChromaRatioSignal() {
  const [chromaRatio, setChromaRatio] = createSignal(0.8)
  return [chromaRatio, (newChromaRatio: number) => setChromaRatio(roundAt(clamp(0, newChromaRatio, 1), 3))] as const
}

function createLightnessSignal() {
  const [Lightness, setLightness] = createSignal(0.5)
  return [Lightness, (newLightness: number) => setLightness(roundAt(clamp(0, newLightness, 1), 3))] as const
}

/** Easing function for lightness */
function ease(x: number): number {
  return Math.pow(x, 0.74)
}

export function App() {
  const SLIDER_SIZE_PX = 360

  const [hue, setHue] = createHueSignal()
  const [chromaRatio, setChromaRatio] = createChromaRatioSignal()
  const [lightness, setLightness] = createLightnessSignal()
  const easedLightness = createMemo(() => ease(lightness()))
  const color = createMemo(() => createColorByChromaRatio(easedLightness(), chromaRatio(), hue()))

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
        const ratio = (mouseX - elementX) / SLIDER_SIZE_PX
        setter(maxValue * ratio)
      }
    }

  return (
    <main style={{ display: 'flex', 'justify-content': 'center', '--currentColor': color().to('hsl').toString() }}>
      <div>
        <h1>Oklch color picker</h1>

        <fieldset>
          <legend>Input</legend>

          <div class={classes.sliders}>
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
          </div>

          <div
            style={{
              'margin-top': '2em',
              width: 'max-content',
              display: 'grid',
              'grid-template-columns': 'auto 5em',
              'align-items': 'center',
              gap: '1em',
            }}
          >
            <div style={{ display: 'flex', 'align-items': 'center' }}>
              Lightness
              <Popover
                launcher={({ openPopover }) => (
                  <Gravity>
                    <IconButton src={helpCircleIcon} size="1.3em" iconColor="hsl(0 0% 50%)" onClick={openPopover} />
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
            <NumberInput value={lightness()} min={0} max={1} required onValid={setLightness} />
            <div style={{ display: 'flex', 'align-items': 'center' }}>
              Chroma
              <Popover
                launcher={({ openPopover }) => (
                  <Gravity>
                    <IconButton src={helpCircleIcon} size="1.3em" iconColor="hsl(0 0% 50%)" onClick={openPopover} />
                  </Gravity>
                )}
              >
                <p style={{ margin: '1em', 'font-size': '0.9em' }}>
                  Instead of the original chroma value in Oklch, it represents the ratio of the maximum chroma within
                  the sRGB color gamut. The maximum chroma is determined by lightness and hue.
                </p>
              </Popover>
            </div>
            <NumberInput value={chromaRatio()} min={0} max={1} required onValid={setChromaRatio} />
            <div>Hue</div>
            <NumberInput value={hue()} min={0} max={360} required onValid={setHue} />
          </div>
        </fieldset>

        <fieldset>
          <legend>Preview</legend>

          <div style={{ width: 'max-content', display: 'grid', 'grid-template-columns': 'auto auto auto', gap: '1em' }}>
            <div class={classes.previewBlackText}>Sample</div>
            <div class={classes.previewWhiteText}>Sample</div>
            <div class={classes.previewBorder}>Sample</div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Output</legend>

          <div style={{ display: 'grid', 'grid-template-columns': 'auto', gap: '0.6em' }}>
            <code class={classes.cssColorText}>{color().toString()}</code>
            <code class={classes.cssColorText}>{color().to('hsl').toString()}</code>
            <code class={classes.cssColorText}>{color().to('srgb').toString()}</code>
            <code class={classes.cssColorText}>{color().to('srgb').toString({ format: 'hex' })}</code>
            <code class={classes.cssColorText}>{color().to('oklab').toString()}</code>
            <code class={classes.cssColorText}>{color().to('lch').toString()}</code>
            <code class={classes.cssColorText}>{color().to('lab').toString()}</code>
          </div>
        </fieldset>
      </div>
    </main>
  )
}
