import './tokens.css'
import './dialog.css'

export function Dialog() {
  let dialog!: HTMLDialogElement
  return (
    <>
      <button type="button" onClick={() => dialog.showModal()}>
        Open overlay probe
      </button>
      <dialog class="erx-dialog" ref={dialog}>
        <form method="dialog">
          <button>Close</button>
        </form>
      </dialog>
    </>
  )
}
