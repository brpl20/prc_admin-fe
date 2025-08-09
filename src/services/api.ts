import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// Cache de sessão para evitar múltiplas chamadas simultâneas
let sessionCache: any = null;
let sessionPromise: Promise<any> | null = null;
let lastSessionCheck = 0;
const SESSION_CACHE_TIME = 5000; // 5 segundos

const getCachedSession = async () => {
  const now = Date.now();
  
  // Se tem cache válido, usar ele
  if (sessionCache && (now - lastSessionCheck) < SESSION_CACHE_TIME) {
    return sessionCache;
  }
  
  // Se já há uma promise em andamento, aguardar ela
  if (sessionPromise) {
    return sessionPromise;
  }
  
  // Criar nova promise de sessão
  sessionPromise = getSession();
  
  try {
    sessionCache = await sessionPromise;
    lastSessionCheck = now;
    return sessionCache;
  } finally {
    sessionPromise = null;
  }
};

// Função para limpar o cache quando necessário
export const clearSessionCache = () => {
  sessionCache = null;
  sessionPromise = null;
  lastSessionCheck = 0;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const serverApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    // Skip authentication for public endpoints
    const publicEndpoints = ['/register', '/login'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (isPublicEndpoint) {
      return config;
    }

    const session = await getCachedSession();
    if (!session) {
      signOut();
      return config;
    }

    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error);
  },
);

export default api;
