import { useState } from 'react';
import { Modal, Button } from '@mui/material';
import { MdClose } from 'react-icons/md';
import { Notification } from '@/components';

import { deleteProfileCustomer } from '@/services/customers';
import { deleteWork } from '@/services/works';
import { deleteJob } from '@/services/tasks';
import { deleteProfileAdmin } from '@/services/admins';
import { deleteOffice } from '@/services/offices';

type RemoveProps = {
  isOpen: boolean;
  onClose: () => void;
  handleCloseModal: () => void;
  id: string;
  textConfirmation: string;
  model: string;
};

const ModalOfRemove = ({
  isOpen,
  onClose,
  id,
  textConfirmation,
  model,
  handleCloseModal,
}: RemoveProps) => {
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [typeMessage, setTypeMessage] = useState<'success' | 'error'>('success');

  const [inputValue, setInputValue] = useState('');
  const [textButton, setTextButton] = useState('Eu quero remover este cliente');
  const [steps, setSteps] = useState(0);

  const handleClose = () => {
    onClose();
  };

  const handleNext = async () => {
    switch (steps) {
      case 0:
        setSteps(steps + 1);
        setTextButton('Eu entendo que tudo será apagado');
        break;
      case 1:
        setSteps(steps + 1);
        setTextButton(`Remover ${model}`);
        break;
      case 2:
        setLoading(true);

        try {
          if (model === 'cliente') await deleteProfileCustomer(id);
          if (model === 'trabalho') await deleteWork(id);
          if (model === 'tarefa') await deleteJob(id);
          if (model === 'admin') await deleteProfileAdmin(id);
          if (model === 'escritório') await deleteOffice(id);

          setLoading(false);
          handleCloseModal();
          onClose();
        } catch (error: any) {
          setMessage(`Erro ao remover ${model}`);
          setTypeMessage('error');
          setOpenSnackbar(true);
          setLoading(false);
        }
        break;
    }
  };

  return (
    <>
      {openSnackbar && (
        <Notification
          open={openSnackbar}
          message={message}
          severity={typeMessage}
          onClose={() => setOpenSnackbar(false)}
        />
      )}

      <Modal open={isOpen} onClose={onClose}>
        <span className="absolute top-1/2 left-1/2 rounded transform -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white">
          <div className="flex w-full justify-between p-4">
            <label className="text-lg font-medium w-[420px] truncate overflow-hidden whitespace-nowrap">{`Remover ${textConfirmation}`}</label>

            <span className="flex justify-center items-center p-1 bg-[#01013D3f] w-[30px] h-[30px] rounded">
              <MdClose onClick={handleClose} size={20} className="cursor-pointer" />
            </span>
          </div>

          {steps === 0 && (
            <div className="flex flex-col justify-center items-center border-[#C0C0C0]	 border-solid border-y-[1px] py-8">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              <div className="mt-3 text-center sm:mt-5">
                <label className="text-xl	font-semibold">{textConfirmation}</label>
              </div>
            </div>
          )}

          {steps === 1 && (
            <div className="flex flex-col justify-center items-center border-[#C0C0C0] list-disc border-solid border-y-[1px] py-8">
              <li className="px-8">
                <label className="text-lg	font-medium">
                  Ao remover este item, todas as relações associadas serão permanentemente apagadas
                  e não poderão mais ser encontradas no sistema.
                </label>
              </li>
            </div>
          )}

          {steps === 2 && (
            <div className="flex flex-col justify-center items-center border-[#C0C0C0]	 border-solid border-y-[1px] py-8">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              <div className="mt-3 text-center sm:mt-5">
                <label className="text-xl	font-semibold">{textConfirmation}</label>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 p-4">
            {steps === 2 && (
              <div className="flex flex-col gap-[2px]">
                <label className="text-sm font-semibold">{`Para confirmar, digite “${textConfirmation}” no campo abaixo.`}</label>

                <input
                  type="text"
                  className="w-full focus:outline-none h-[36px] border-solid border-2 border-red-600 rounded p-2"
                  onChange={e => {
                    setInputValue(e.target.value);
                  }}
                />
              </div>
            )}

            <div className="w-full">
              <Button
                variant="contained"
                color="primary"
                className="w-full h-[36px]"
                disabled={inputValue !== textConfirmation && steps === 2}
                onClick={() => {
                  !loading ? handleNext() : null;
                }}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="w-4 h-4 border-2 border-t-[#fff] rounded-full animate-spin" />
                  </div>
                ) : (
                  textButton
                )}
              </Button>
            </div>
          </div>
        </span>
      </Modal>
    </>
  );
};

export default ModalOfRemove;
