import React, { createContext, useState, ReactNode } from 'react';

interface IContextValue {
  customerForm: any;
  setCustomerForm: (data: any) => void;

  newCustomerForm: any;
  setNewCustomerForm: (data: any) => void;

  clearCustomerForm: () => void;
}

interface IProps {
  children: ReactNode;
}

export const CustomerContext = createContext<IContextValue>({} as IContextValue);

const CustomerProvider = ({ children }: IProps) => {
  const [customerForm, setCustomerForm] = useState<any>({} as any);

  const [newCustomerForm, setNewCustomerForm] = useState<any>({} as any);

  const clearCustomerForm = () => {
    setCustomerForm({} as any);
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
