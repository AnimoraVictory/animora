import "./Toast.scss"

interface ToastProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  return (
    <div className={`toast ${type} show`} onClick={onClose}>
      <div className="toast-content">{message}</div>
      <button className="toast-button" onClick={onClose}>×</button>
    </div>
  )
}

export default Toast
