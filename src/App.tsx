import { clamp, isInstanceOf, modOf, rangeUntil, roundAt } from 'base-up'
import { Triangle } from 'solid-design-parts'
import { createMemo, createSignal } from 'solid-js'
import classes from './App.module.scss'
import { createColorByChromaRatio, toHsl } from './color'

function createHueSignal() {
  const [hue, setHue] = createSignal(120)
  return [hue, (newHue: number) => setHue(roundAt(modOf(newHue, 360 as number), 1))] as const
}

function createChromaRatioSignal() {
  const [chromaRatio, setChromaRatio] = createSignal(0.5)
  return [chromaRatio, (newChromaRatio: number) => setChromaRatio(roundAt(clamp(0, newChromaRatio, 1), 3))] as const
}

function createLightnessSignal() {
  const [Lightness, setLightness] = createSignal(0.8)
  return [Lightness, (newLightness: number) => setLightness(roundAt(clamp(0, newLightness, 1), 3))] as const
}

export function App() {
  const SLIDER_SIZE_PX = 361

  const [hue, setHue] = createHueSignal()
  const [chromaRatio, setChromaRatio] = createChromaRatioSignal()
  const [lightness, setLightness] = createLightnessSignal()
  const color = createMemo(() => createColorByChromaRatio(lightness(), chromaRatio(), hue()))

  const onInput = (setter: (value: number) => void) => (event: InputEvent) => {
    if (!isInstanceOf(event.target, HTMLInputElement)) return

    const newValue = event.target.value
    setter(Number(newValue))
  }

  const onMouseDown =
    (setter: (value: number) => void, maxValue: number = 1) =>
    (event: MouseEvent) => {
      event.preventDefault()

      if (!isInstanceOf(event.currentTarget, HTMLElement)) return

      const mouseX = event.clientX
      const elementX = Math.floor(event.currentTarget.getBoundingClientRect().x)
      const ratio = (mouseX - elementX) / SLIDER_SIZE_PX
      setter(maxValue * ratio)
    }

  const onMouseMove =
    (setter: (value: number) => void, maxValue: number = 1) =>
    (event: MouseEvent) => {
      // if left-mouse-button is not pressed
      if ((event.buttons & 1) === 0) return

      if (!isInstanceOf(event.currentTarget, HTMLElement)) return

      const mouseX = event.clientX
      const elementX = Math.floor(event.currentTarget.getBoundingClientRect().x)
      const ratio = (mouseX - elementX) / SLIDER_SIZE_PX
      setter(maxValue * ratio)
    }

  return (
    <main style={{ display: 'flex', 'justify-content': 'center', '--currentColor': color().to('hsl').toString() }}>
      <div>
        <h1>Oklch color picker</h1>

        <fieldset>
          <legend>Input</legend>

          <div
            style={{
              width: 'max-content',
              display: 'grid',
              'grid-template-columns': 'auto 5em',
              gap: '1em',
              padding: '1em',
            }}
          >
            明度（Lightness）
            <input type="number" value={lightness()} min={0} max={1} step={0.1} onInput={onInput(setLightness)} />
            彩率（Chroma ratio）
            <input type="number" value={chromaRatio()} min={0} max={1} step={0.1} onInput={onInput(setChromaRatio)} />
            色相（Hue）
            <input type="number" value={hue()} min={0} max={360} onInput={onInput(setHue)} />
          </div>

          <div class={classes.sliders}>
            <div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${lightness() * 100}%` }}>
                <Triangle direction="down" />
              </div>
              <div
                class={classes.sliderTrack}
                onMouseDown={onMouseDown(setLightness)}
                onMouseMove={onMouseMove(setLightness)}
              >
                {rangeUntil(SLIDER_SIZE_PX as number).map((index) => (
                  <div style={{ background: toHsl(index / (SLIDER_SIZE_PX - 1), chromaRatio(), hue()) }} />
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
              <div
                class={classes.sliderTrack}
                onMouseDown={onMouseDown(setChromaRatio)}
                onMouseMove={onMouseMove(setChromaRatio)}
              >
                {rangeUntil(SLIDER_SIZE_PX as number).map((index) => (
                  <div style={{ background: toHsl(lightness(), index / (SLIDER_SIZE_PX - 1), hue()) }} />
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
              <div
                class={classes.sliderTrack}
                onMouseDown={onMouseDown(setHue, 360)}
                onMouseMove={onMouseMove(setHue, 360)}
              >
                {rangeUntil(SLIDER_SIZE_PX as number).map((index) => (
                  <div
                    style={{
                      background: toHsl(lightness(), chromaRatio(), (360 * index) / (SLIDER_SIZE_PX - 1)),
                    }}
                  />
                ))}
              </div>
              <div class={classes.sliderMarkerCage} style={{ 'margin-left': `${(hue() / 360) * 100}%` }}>
                <Triangle />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Preview</legend>

          <div style={{ width: 'max-content', display: 'grid', 'grid-template-columns': 'auto auto auto', gap: '1em' }}>
            <div class={classes.previewBlackText}>Black</div>
            <div class={classes.previewWhiteText}>White</div>
            <div class={classes.previewBorder}>Border</div>
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
