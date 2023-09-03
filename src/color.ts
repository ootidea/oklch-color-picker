import Color from 'colorjs.io'

/** calculateMaxChromaInGamut関数の戻り値をメモ化するためのオブジェクト */
const maxChromaMemo: Record<string, number> = {}

/** sRGBの色域に収まる最大のchroma値を二分法で探索する */
export function calculateMaxChromaInGamut(lightness: number, hue: number, delta: number = 0.001): number {
  const memoKey = `${lightness},${hue}`
  const cachedValue = maxChromaMemo[memoKey]
  if (cachedValue !== undefined) return cachedValue

  // 二分法の探索範囲の下限
  let lowerBound = 0
  // 二分法の探索範囲の上限。
  // sRGBでの最大値は0.321台であり、0.322以下だと分かっている。
  // そのことは次のウェブページでも確認できる。
  // https://oklch.evilmartians.io/#69.9,0.321,328.24,100
  let upperBound = 0.322
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

export function createColorByChromaRatio(lightness: number, chromaRatio: number, hue: number) {
  const maxChroma = calculateMaxChromaInGamut(lightness, hue)
  return new Color('oklch', [lightness, maxChroma * chromaRatio, hue], 1)
}

export function toHsl(lightness: number, chromaRatio: number, hue: number): string {
  return createColorByChromaRatio(lightness, chromaRatio, hue).to('hsl').toString()
}

export function isInvalidColorString(colorString: string): boolean {
  try {
    new Color(colorString)
  } catch {
    return true
  }
  return false
}

/** Easing function for lightness */
export function ease(x: number): number {
  return Math.pow(x, 0.74)
}

export function unease(x: number): number {
  return Math.pow(x, 1 / 0.74)
}
