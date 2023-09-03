import Color from 'colorjs.io'
import { Button, Gravity, IconButton, Modal, TextInput } from 'solid-design-parts'
import { batch, createSignal } from 'solid-js'
import { calculateMaxChromaInGamut, isInvalidColorString, unease } from './color'
import editIcon from './image/edit-outline.svg'
import { setChromaRatio, setHue, setLightness } from './signal'

export function CssColorOutput(props: { color: string }) {
  return (
    <div style={{ display: 'flex', 'justify-content': 'space-between' }}>
      <div>{props.color}</div>
      <Modal
        launcher={({ openModal }) => <IconButton src={editIcon} color="oklch(50% 0 0)" onClick={openModal} />}
        title="Edit CSS color"
        showCloseButton
      >
        {({ closeModal }) => {
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
              }}
            >
              <TextInput
                value={colorString()}
                error={isInvalidColorString}
                style={{ 'min-width': '20em' }}
                onValid={setColorString}
              />
              <Gravity to="right" style={{ padding: '0.5em 1em' }}>
                <Button type="submit" onClick={closeModal}>
                  OK
                </Button>
              </Gravity>
            </form>
          )
        }}
      </Modal>
    </div>
  )
}
