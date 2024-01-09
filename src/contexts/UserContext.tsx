import React, { createContext, useState, ReactNode } from 'react';

interface IContextValue {
  userForm: any;
  setUserForm: (data: any) => void;
}

interface IProps {
  children: ReactNode;
}

export const UserContext = createContext<IContextValue>({} as IContextValue);

const UserProvider = ({ children }: IProps) => {
  const [userForm, setUserForm] = useState<any>();

  return (
    <UserContext.Provider
      value={{
        userForm,
        setUserForm,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
