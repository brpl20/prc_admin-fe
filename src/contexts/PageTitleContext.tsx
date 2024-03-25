import { createContext, useEffect, useState } from 'react';

interface IContextValue {
  showTitle: boolean;
  setShowTitle: (data: any) => void;
  pageTitle: string;
  setPageTitle: (data: any) => void;
  customerTitle: string;
  setCustomerTitle: (data: any) => void;
}

interface IProps {
  children: React.ReactNode;
}

export const PageTitleContext = createContext<IContextValue>({} as IContextValue);

const PageTitleProvider = ({ children }: IProps) => {
  const [showTitle, setShowTitle] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [customerTitle, setCustomerTitle] = useState('');

  return (
    <PageTitleContext.Provider
      value={{
        showTitle,
        setShowTitle,
        pageTitle,
        setPageTitle,
        customerTitle,
        setCustomerTitle,
      }}
    >
      {children}
    </PageTitleContext.Provider>
  );
};

export default PageTitleProvider;
