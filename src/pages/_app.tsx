import type { AppProps } from 'next/app';

import '@/styles/index.css';
import { theme } from '@/styles/globals';
import { ThemeProvider } from '@mui/material/styles';
import WorkProvider from '@/contexts/WorkContext';
import CustomerProvider from '@/contexts/CustomerContext';
import PageTitleProvider from '@/contexts/PageTitleContext';
import TeamProvider from '@/contexts/TeamContext';

import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';

const clientSideEmotionCache = createEmotionCache();

export interface StudioAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const StudioApp = (props: StudioAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const router = useRouter();
  const params = router.query.type;

  if (typeof window !== 'undefined') {
    if (params != 'cadastrar' && params != 'editar') {
      for (const key in localStorage) {
        if (key.startsWith('PF/') || key.startsWith('PJ/') || key.startsWith('WORK/')) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>ProcStudio</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SessionProvider session={pageProps.session}>
          <TeamProvider>
            <CustomerProvider>
              <PageTitleProvider>
                <WorkProvider>
                  <Component {...pageProps} />
                </WorkProvider>
              </PageTitleProvider>
            </CustomerProvider>
          </TeamProvider>
        </SessionProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default StudioApp;
