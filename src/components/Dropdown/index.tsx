'use client';

import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface DropdownProps {
  title: string;
  content: string;
}

const Dropdown: React.FC<DropdownProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="border-b border-gray-300 w-full lg:w-[780px] pb-4 mb-4">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-lg font-semibold">{title}</span>
        <FiChevronDown
          className={`text-xl text-[#0277EE] transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 flex text-start text-gray-700">
          <p>{content}</p>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
