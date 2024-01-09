interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  editMode: boolean;
  handleSave: (title: string) => void;
}

export type { IModalProps };
