import React from 'react';
import { Modal } from '@carbon/react';

type ConfirmModalProps = {
  open: boolean;
  heading: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  heading,
  message,
  primaryButtonText,
  secondaryButtonText,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      modalHeading={heading}
      primaryButtonText={primaryButtonText}
      secondaryButtonText={secondaryButtonText}
      onRequestSubmit={onConfirm}
      onRequestClose={onCancel}
      size="sm"
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
