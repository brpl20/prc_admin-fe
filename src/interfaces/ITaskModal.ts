import { IAttributesProps } from './ITask';

interface ITaskModalProps {
  isOpen: boolean;
  dataToEdit?: IAttributesProps;
  onClose: () => void;
  showMessage: (message: string, type?: 'success' | 'error') => void;
}

export type { ITaskModalProps };
