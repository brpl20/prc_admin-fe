import React, {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  ChangeEvent,
  DragEvent,
} from 'react';

import Dropzone from 'react-dropzone';
import { MdDelete, MdOutlineInfo } from 'react-icons/md';

import { useRouter } from 'next/router';
import CustomTooltip from '@/components/Tooltip';

import CheckBox from '@/components/CheckBox';
import { Container } from '../styles';

import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import { Box, Typography } from '@mui/material';

export interface IRefPJCustomerStepFourProps {
  handleSubmitForm: () => void;
}

interface IStepFourProps {
  confirmation: () => void;
  editMode: boolean;
}

const PJCustomerStepFour: ForwardRefRenderFunction<IRefPJCustomerStepFourProps, IStepFourProps> = (
  { confirmation, editMode },
  ref,
) => {
  const router = useRouter();
  const isEdit = router.asPath.includes('alterar');

  const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
    useContext<any>(CustomerContext);
  const [checkedItems, setCheckedItems] = useState({
    issue_documents: false,
  });

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setCheckedItems(prevItems => ({
      ...prevItems,
      [name]: checked,
    }));
  };

  const handleSubmitForm = () => {
    const data = {
      ...customerForm,
      customer_type: 'legal_person',
    };

    setCustomerForm(data);

    setNewCustomerForm({
      ...newCustomerForm,
      ...data,
    });

    confirmation();

    scroll.scrollToTop({
      duration: 500,
      smooth: 'easeInOutQuart',
    });
  };

  useImperativeHandle(ref, () => ({
    handleSubmitForm,
  }));

  return (
    <div
      className="
      w-full
      min-h-[348px]
      mt-4
    "
    >
      <Box>
        <Typography
          display={'flex'}
          alignItems={'center'}
          variant="h6"
          sx={{ marginBottom: '16px' }}
        >
          {'Gerar Procuração Simples'}
        </Typography>

        <Box display={'flex'} flexDirection={'column'} gap={'16px'}>
          <div className="flex">
            <CheckBox
              label={isEdit ? 'Reemitir procuração simples' : 'Emitir procuração simples'}
              isDisabled={true}
              name="issue_documents"
              checked={checkedItems.issue_documents}
              onChange={handleCheckboxChange}
            />

            <CustomTooltip
              title="A geração deste documento ainda não está disponível."
              placement="right"
            >
              <span
                aria-label="Pré-Definição"
                style={{
                  display: 'flex',
                }}
              >
                <MdOutlineInfo style={{ marginLeft: '-6px' }} size={20} />
              </span>
            </CustomTooltip>
          </div>
        </Box>
      </Box>
    </div>
  );
};

export default forwardRef(PJCustomerStepFour);
