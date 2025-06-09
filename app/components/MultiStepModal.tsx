import React from 'react';
import { Modal, TextInput, TextArea } from '@carbon/react';
import { formatDate, formatSize } from '@/app/utils/dateUtils';

interface Document {
  [key: string]: string | number | null | undefined;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface MultiStepModalProps {
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  steps: { label: string; optional?: boolean }[];
  currentStep: number;
  modalHeading?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onRequestSubmit?: () => void;
  onRequestSecondary?: () => void;
  selectedDoc?: Document;
  headers?: { key: string; header: string }[];
}

const MultiStepModal: React.FC<MultiStepModalProps> = ({
  children,
  open,
  onClose,
  modalHeading = '',
  primaryButtonText = 'Next',
  secondaryButtonText = 'Previous',
  onRequestSubmit,
  onRequestSecondary,
  selectedDoc,
  headers
}) => {
  return (
    <Modal
      open={open}
      modalHeading={modalHeading}
      primaryButtonText={primaryButtonText}
      secondaryButtonText={secondaryButtonText}
      onRequestClose={onClose}
      onRequestSubmit={onRequestSubmit}
      onSecondarySubmit={onRequestSecondary}
      passiveModal={false}
      size="lg"
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginTop: 24,
        backgroundColor: '#161616'
      }}>
        {selectedDoc && headers ? (
          <>
            {headers.map(h => (
              <TextInput
                key={h.key}
                id={h.key}
                labelText={h.header}
                value={
                  h.key === 'size'
                    ? formatSize(Number(selectedDoc[h.key]))
                    : h.key === 'created_at' || h.key === 'updated_at' || h.key === 'publishedAt'
                      ? formatDate(selectedDoc[h.key] as string)
                      : String(selectedDoc[h.key] ?? '')
                }
                readOnly
                style={{ marginBottom: 16, backgroundColor: '#262626', width: '100%'}}
              />
            ))}
            {children}
          </>
        ) : (
          <></>
        )}
      </div>
    </Modal>
  );
};

export default MultiStepModal;