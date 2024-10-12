import { Button, Icon, IconButton, Modal, TextInput } from '@ootidea/solidjs-modular-components'
import Color from 'colorjs.io'
import { batch, createSignal } from 'solid-js'
import { calculateMaxChromaInGamut, isInvalidColorString, unease } from './color'
import editIcon from './image/edit-outline.svg'
import { setChromaRatio, setHue, setLightness } from './signal'

export function CssColorOutput(props: { color: string }) {
  return (
    <div style={{ display: 'flex', 'justify-content': 'space-between' }}>
      <div>{props.color}</div>
      <Modal
        trigger={(openModal) => (
          <IconButton onClick={openModal}>
            <Icon src={editIcon} color="oklch(50% 0 0)" />
          </IconButton>
        )}
        title="Edit CSS color"
        showCloseButton
      >
        {(closeModal) => {
          const [colorString, setColorString] = createSignal(props.color)
          return (
            <form
              style={{ padding: '1em' }}
              onSubmit={(e) => {
                e.preventDefault()

                if (isInvalidColorString(colorString())) return

                const oklch = new Color(colorString()).to('oklch')
                const lightness = oklch.get('l')
                const chroma = oklch.get('c')
                const hue = oklch.get('h')
                batch(() => {
                  setLightness(unease(lightness))
                  setChromaRatio(chroma / calculateMaxChromaInGamut(lightness, hue))
                  setHue(hue)
                })
                closeModal()
              }}
            >
              <TextInput
                value={colorString()}
                aria-invalid={isInvalidColorString(colorString())}
                style={{ 'min-width': '20em' }}
                onChange={setColorString}
              />
              <div style={{ display: 'flex', 'justify-content': 'end', padding: '0.5em 1em' }}>
                <Button type="submit">OK</Button>
              </div>
            </form>
          )
        }}
      </Modal>
    </div>
  )
}
