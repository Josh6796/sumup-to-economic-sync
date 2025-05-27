// src/utils/logger.ts
import axios from 'axios';

export function logInfo(message: string): void {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

export function logError(message: string, error?: unknown): void {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  if (axios.isAxiosError(error)) {
    console.error('AxiosError:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      headers: error.config?.headers
    });
  } else if (error instanceof Error) {
    console.error(error.stack);
  } else if (error) {
    console.error(error);
  }
}
