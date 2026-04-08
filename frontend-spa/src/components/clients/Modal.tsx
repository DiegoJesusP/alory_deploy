import type { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: Props) => {

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        <button style={closeStyle} onClick={onClose}>
          X
        </button>

        {children}

      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
};

const closeStyle = {
  float: "right" as const,
  cursor: "pointer",
};

export default Modal;