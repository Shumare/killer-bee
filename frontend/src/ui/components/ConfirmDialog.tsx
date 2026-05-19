interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button type="button" className="button-danger" onClick={onConfirm}>
            Supprimer
          </button>
          <button type="button" className="button-secondary" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
