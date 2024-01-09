import Link, { LinkProps } from 'next/link';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';

import { cloneElement } from 'react';

import { colors } from '@/styles/globals';

interface ActiveLinkProps extends LinkProps {
  children: React.ReactElement;
}

const ActiveLink = ({ children, ...rest }: ActiveLinkProps) => {
  let showTitle = false;
  const { asPath } = useRouter();

  if (asPath === rest.href || asPath === rest.as) {
    showTitle = true;
  }

  return (
    <Link {...rest}>
      <Box display="flex" />
      {cloneElement(children)}
    </Link>
  );
};

export default ActiveLink;
