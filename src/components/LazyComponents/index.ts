import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load heavy components to improve initial load time
export const LazyTeamSetup = dynamic(() => import('../TeamSetup'), {
  loading: () => <div>Carregando configuração do time...</div>,
  ssr: false, // Disable SSR for client-only components
});

export const LazyProfileSetupModal = dynamic(() => import('../ProfileSetupModal'), {
  loading: () => <div>Carregando configuração do perfil...</div>,
  ssr: false,
});

export const LazyDataGrid = dynamic(() => import('@mui/x-data-grid').then(mod => ({ default: mod.DataGrid })), {
  loading: () => <div>Carregando tabela...</div>,
  ssr: false,
});

export const LazyDatePicker = dynamic(() => import('@mui/x-date-pickers').then(mod => ({ default: mod.DatePicker })), {
  loading: () => <div>Carregando seletor de data...</div>,
  ssr: false,
});

// Lazy load React Quill for rich text editing
export const LazyReactQuill = dynamic(() => import('react-quill'), {
  loading: () => <div>Carregando editor...</div>,
  ssr: false,
});

// Create a higher-order component for lazy loading with better error boundaries
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ComponentType,
  options?: {
    ssr?: boolean;
    loading?: ComponentType;
  }
) => {
  return dynamic(importFunc, {
    loading: options?.loading || fallback || (() => <div>Carregando...</div>),
    ssr: options?.ssr ?? true,
  });
};