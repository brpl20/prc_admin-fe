import React, { ReactNode } from 'react';

interface SelectContainerProps {
  isOpen?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export const SelectContainer: React.FC<SelectContainerProps> = ({
  isOpen,
  className = '',
  children,
  onClick,
  ...props
}) => {
  return (
    <div
      className={`flex justify-start items-center ml-auto mr-4 cursor-pointer p-1.5 rounded bg-white bg-opacity-20 ${className}`}
      onClick={onClick}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === SelectItemsContainer) {
            return React.cloneElement(child as React.ReactElement<SelectItemsContainerProps>, {
              isOpen,
            });
          }
          return child;
        }
        return child;
      })}
    </div>
  );
};

interface SelectItemsContainerProps {
  isOpen?: boolean;
  className?: string;
  children: ReactNode;
}

export const SelectItemsContainer: React.FC<SelectItemsContainerProps> = ({
  isOpen,
  className = '',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`w-[180px] mt-[145px] absolute flex flex-col items-start z-10 rounded-lg bg-white shadow ${className}`}
    >
      {children}
    </div>
  );
};

interface SelectItemProps {
  className?: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  className = '',
  children,
  href,
  onClick,
}) => {
  return (
    <a href={href} className={`w-full p-2 no-underline text-black ${className}`} onClick={onClick}>
      <div className="flex items-center gap-2 py-1 pl-3 hover:rounded-lg hover:bg-gray-100">
        {children}
      </div>
    </a>
  );
};

// Exemplo de uso:
/*
<SelectContainer isOpen={isOpen} onClick={toggleOpen} className="custom-class">
  <span>Selecione</span>
  <SelectItemsContainer isOpen={isOpen}>
    <SelectItem>
      <Icon /> Opção 1
    </SelectItem>
    <SelectItem>
      <Icon /> Opção 2
    </SelectItem>
  </SelectItemsContainer>
</SelectContainer>
*/
