import { rangeTo } from 'base-up'
import Color from 'colorjs.io'
import { createMemo, createSignal, Setter } from 'solid-js'
import classes from './App.module.scss'

/** calculateMaxChromaInGamut関数の戻り値をメモ化するためのオブジェクト */
const maxChromaMemo: Record<string, number> = {}

/** sRGBの色域に収まる最大のchroma値を二分探索する */
function calculateMaxChromaInGamut(lightness: number, hue: number, delta: number = 0.001): number {
  const memoKey = `${lightness},${hue}`
  const cachedValue = maxChromaMemo[memoKey]
  if (cachedValue !== undefined) return cachedValue

  // 二分探索の探索範囲の下限
  let lowerBound = 0
  // 二分探索の探索範囲の上限。
  // sRGBでの最大値は0.321台であり、0.322以下だと分かっている。
  // このことは次のウェブページでも確認できる。
  // https://oklch.evilmartians.io/#69.9,0.321,328.24,100
  let upperBound = 0.322
  // 浮動小数点数上の二分探索を行う。探索範囲の下限と上限が十分に近づいたら探索を打ち切る
  while (upperBound - lowerBound > delta) {
    const chroma = lowerBound + (upperBound - lowerBound) / 2
    if (new Color('oklch', [lightness, chroma, hue], 1).inGamut('srgb')) {
      lowerBound = chroma
    } else {
      upperBound = chroma
    }
  }
  return (maxChromaMemo[memoKey] = lowerBound)
}

function createColorByChromaRatio(lightness: number, chromaRatio: number, hue: number) {
  const maxChroma = calculateMaxChromaInGamut(lightness, hue)
  return new Color('oklch', [lightness, maxChroma * chromaRatio, hue], 1)
}

function toHsl(lightness: number, chromaRatio: number, hue: number): string {
  return createColorByChromaRatio(lightness, chromaRatio, hue).to('hsl').toString()
}

export function App() {
  const SLIDER_SIZE_PX = 300

  const [hue, setHue] = createSignal(120)
  const [chromaRatio, setChromaRatio] = createSignal(0.5)
  const [lightness, setLightness] = createSignal(0.8)
  const color = createMemo(() => createColorByChromaRatio(lightness(), chromaRatio(), hue()))

  const onInput = (setter: Setter<number>) => (event: InputEvent) => {
    if (event.target instanceof HTMLInputElement) {
      const newValue = event.target.value
      setter(Number(newValue))
    }
  }

  const onMouseDown =
    (setter: Setter<number>, maxValue: number = 1) =>
    (event: MouseEvent) => {
      if (event.currentTarget instanceof HTMLElement) {
        const mouseX = event.clientX
        const elementX = event.currentTarget.getBoundingClientRect().x
        const ratio = (mouseX - elementX) / SLIDER_SIZE_PX
        setter(maxValue * ratio)
      }
    }

  const onMouseMove =
    (setter: Setter<number>, maxValue: number = 1) =>
    (event: MouseEvent) => {
      // if left-mouse-button is not pressed
      if ((event.buttons & 1) === 0) return

      if (event.currentTarget instanceof HTMLElement) {
        const mouseX = event.clientX
        const elementX = Math.floor(event.currentTarget.getBoundingClientRect().x)
        const ratio = (mouseX - elementX) / SLIDER_SIZE_PX
        setter(maxValue * ratio)
      }
    }

  return (
    <main style={{ display: 'flex', 'justify-content': 'center' }}>
      <div>
        <h1>OKLCH color picker</h1>
        <div
          style={{
            display: 'inline-block',
            padding: '0.5em 0.8em',
            background: color().to('hsl').toString(),
            color: 'black',
          }}
        >
          Black
        </div>

        <div
          style={{
            display: 'inline-block',
            padding: '0.5em 0.8em',
            background: color().to('hsl').toString(),
            color: 'white',
          }}
        >
          White
        </div>

        <div
          style={{
            display: 'inline-block',
            padding: 'calc(0.5em - 1px) calc(0.8em - 1px)',
            border: `1px solid ${color().to('hsl').toString()}`,
            color: color().to('hsl').toString(),
          }}
        >
          Border
        </div>

        <div style={{ display: 'grid', 'grid-template-columns': 'auto', gap: '0.3em' }}>
          <code class={classes.cssColorText}>{color().toString()}</code>
          <code class={classes.cssColorText}>{color().to('hsl').toString()}</code>
          <code class={classes.cssColorText}>{color().to('srgb').toString()}</code>
          <code class={classes.cssColorText}>{color().to('oklab').toString()}</code>
          <code class={classes.cssColorText}>{color().to('lch').toString()}</code>
          <code class={classes.cssColorText}>{color().to('lab').toString()}</code>
        </div>

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

        <div
          class={classes.sliderTrack}
          onMouseDown={onMouseDown(setLightness)}
          onMouseMove={onMouseMove(setLightness)}
        >
          {rangeTo(SLIDER_SIZE_PX).map((index) => (
            <div style={{ background: toHsl(index / (SLIDER_SIZE_PX - 1), chromaRatio(), hue()) }}></div>
          ))}
        </div>

        <div
          class={classes.sliderTrack}
          onMouseDown={onMouseDown(setChromaRatio)}
          onMouseMove={onMouseMove(setChromaRatio)}
        >
          {rangeTo(SLIDER_SIZE_PX).map((index) => (
            <div style={{ background: toHsl(lightness(), index / (SLIDER_SIZE_PX - 1), hue()) }}></div>
          ))}
        </div>

        <div class={classes.sliderTrack} onMouseDown={onMouseDown(setHue, 360)} onMouseMove={onMouseMove(setHue, 360)}>
          {rangeTo(SLIDER_SIZE_PX).map((index) => (
            <div style={{ background: toHsl(lightness(), chromaRatio(), (360 * index) / (SLIDER_SIZE_PX - 1)) }}></div>
          ))}
        </div>
      </div>
    </main>
  )
}
