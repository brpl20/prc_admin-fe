import React, {
  useState,
  useContext,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  ChangeEvent,
} from 'react';

import { useRouter } from 'next/router';

import CheckBox from '@/components/CheckBox';
import { Container } from '../styles';

import { animateScroll as scroll } from 'react-scroll';
import { CustomerContext } from '@/contexts/CustomerContext';

import { Box, Typography } from '@mui/material';

export interface IRefPFCustomerStepSixProps {
  handleSubmitForm: () => void;
}

interface IStepSixProps {
  confirmation: () => void;
  editMode: boolean;
}

const PFCustomerStepSix: ForwardRefRenderFunction<IRefPFCustomerStepSixProps, IStepSixProps> = (
  { confirmation, editMode },
  ref,
) => {
  const router = useRouter();
  const isEdit = router.asPath.includes('alterar');
  const { customerForm, setCustomerForm, newCustomerForm, setNewCustomerForm } =
    useContext(CustomerContext);
  const [checkedItems, setCheckedItems] = useState({
    issue_documents: false,
  });

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setCheckedItems(prevItems => ({
      ...prevItems,
      [name]: checked,
    }));
  };
  const handleSubmitForm = () => {
    let data = {};

    if (checkedItems.issue_documents) {
      data = {
        customer_type: 'physical_person',
        issue_documents: checkedItems.issue_documents,
        customer_files_attributes: [
          {
            file_description: 'simple_procuration',
          },
        ],
      };
    }

    if (!checkedItems.issue_documents) {
      data = {
        customer_type: 'physical_person',
        issue_documents: checkedItems.issue_documents,
      };
    }

    setNewCustomerForm({
      ...newCustomerForm,
      ...data,
    });

    setCustomerForm({
      ...customerForm,
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
    <>
      <Container style={{ display: 'flex', gap: '24px' }}>
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
            <CheckBox
              label={isEdit ? 'Reemitir procuração simples' : 'Emitir procuração simples'}
              name="issue_documents"
              checked={checkedItems.issue_documents}
              onChange={handleCheckboxChange}
            />
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default forwardRef(PFCustomerStepSix);
