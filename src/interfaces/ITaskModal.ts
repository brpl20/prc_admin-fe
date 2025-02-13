import { IAttributesProps } from './ITask';

interface ITaskModalProps {
  isOpen: boolean;
  dataToEdit?: IAttributesProps;
  onClose: () => void;
}

export type { ITaskModalProps };
