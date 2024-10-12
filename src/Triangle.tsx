import { mergeProps } from 'solid-js'

export type TriangleProps = {
  direction?: 'up' | 'down'
}

export function Triangle(rawProps: TriangleProps) {
  const props = mergeProps({ direction: 'up' }, rawProps)
  const clipPath = () => (props.direction === 'up' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'polygon(50% 100%, 0% 0%, 100% 0%)')
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'currentColor',
        'clip-path': clipPath(),
      }}
    />
  )
}
