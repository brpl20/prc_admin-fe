import React, { createContext, useState } from 'react';
import { IAttributesProps } from '@/interfaces/IWork';

interface IContextValue {
  workForm: IAttributesProps;
  setWorkForm: (data: any) => void;
}

interface IProps {
  children: React.ReactNode;
}

export const WorkContext = createContext<IContextValue>({} as IContextValue);

const WorkProvider = ({ children }: IProps) => {
  const [workForm, setWorkForm] = useState<IAttributesProps>({} as IAttributesProps);

  return (
    <WorkContext.Provider
      value={{
        workForm,
        setWorkForm,
      }}
    >
      {children}
    </WorkContext.Provider>
  );
};

export default WorkProvider;
