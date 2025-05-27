// src/clients/sumupClient.ts

import axios from 'axios';
import { logInfo, logError } from '../utils/logger';

const baseURL = 'https://api.sumup.com';

export async function getTransactions(
  start: string,
  end: string
): Promise<any[]> {
  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;

  if (!apiKey || !merchantCode) {
    throw new Error('Missing SUMUP_API_KEY or SUMUP_MERCHANT_CODE in environment');
  }

  try {
    logInfo('Fetching transactions for merchant ' + merchantCode + ' from ' + start + ' to ' + end);

    const res = await axios.get(
      baseURL + '/v2.1/merchants/' + merchantCode + '/transactions/history',
      {
        headers: {
          Authorization: 'Bearer ' + apiKey
        },
        params: {
          oldest_time: start,
          newest_time: end,
          limit: 1000
        }
      }
    );

    logInfo('Fetched ' + res.data.items.length + ' transactions');

    return res.data.items;
  } catch (error) {
    logError('Failed to fetch transactions from SumUp', error);
    throw error;
  }
}

export async function getPayouts(start: string, end: string): Promise<any[]> {
  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;

  if (!apiKey || !merchantCode) {
    throw new Error('Missing SUMUP_API_KEY or SUMUP_MERCHANT_CODE in environment');
  }

  try {
    logInfo(`Fetching payouts from ${start} to ${end}`);
    const res = await axios.get(`${baseURL}/v1.0/merchants/${merchantCode}/payouts`, {
      headers: {
        Authorization: 'Bearer ' + apiKey
      },
      params: {
        start_date: start,
        end_date: end
      }
    });

    return res.data;
  } catch (error) {
    logError('Failed to fetch payouts from SumUp', error);
    throw error;
  }
}

