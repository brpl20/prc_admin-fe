import React, { createContext, useState, ReactNode } from 'react';
import { IAttributesProps } from '@/interfaces/ICustomer';

interface IContextValue {
  customerForm: IAttributesProps;
  setCustomerForm: (data: any) => void;

  newCustomerForm: IAttributesProps;
  setNewCustomerForm: (data: any) => void;

  clearCustomerForm: () => void;
}

interface IProps {
  children: ReactNode;
}

export const CustomerContext = createContext<IContextValue>({} as IContextValue);

const CustomerProvider = ({ children }: IProps) => {
  const [customerForm, setCustomerForm] = useState<IAttributesProps>({} as IAttributesProps);

  const [newCustomerForm, setNewCustomerForm] = useState<IAttributesProps>({} as IAttributesProps);

  const clearCustomerForm = () => {
    setCustomerForm({} as IAttributesProps);
  };

  return (
    <CustomerContext.Provider
      value={{
        customerForm,
        newCustomerForm,
        setNewCustomerForm,
        setCustomerForm,
        clearCustomerForm,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerProvider;
