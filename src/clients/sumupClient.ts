import axios from 'axios';
import { logInfo, logError } from '../utils/logger';
import { SumUpTransaction } from '../types/sumUpTransaction';
import { SumUpTransactionDetails } from '../types/sumUpTransactionDetails';
import { SumUpPayout } from '../types/sumUpPayout';

const baseURL = 'https://api.sumup.com';

export async function getTransactions(
  start: string,
  end: string
): Promise<SumUpTransaction[]> {
  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;

  if (!apiKey || !merchantCode) {
    throw new Error('Missing SUMUP_API_KEY or SUMUP_MERCHANT_CODE in environment');
  }

  const allItems: SumUpTransaction[] = [];
  let url = `${baseURL}/v2.1/merchants/${merchantCode}/transactions/history?oldest_time=${start}&newest_time=${end}&limit=1000`;

  try {
    logInfo(`Fetching transactions for merchant ${merchantCode} from ${start} to ${end}`);

    let page = 1;

    while (true) {
      logInfo(`Fetching page ${page} of transactions...`);

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

      const items = res.data.items || [];
      if (items.length === 0) break;

      allItems.push(...items);
      process.stdout.write(`\rFetched page ${page}, total transactions: ${allItems.length}`);

      const nextLink = res.data.links?.find((link: any) => link.rel === 'next');
      if (!nextLink?.href) break;

      url = nextLink.href.startsWith('http')
        ? nextLink.href
        : `${baseURL}/v2.1/merchants/${merchantCode}/transactions/history${nextLink.href.startsWith('?') ? '' : '?'}${nextLink.href}`;

      page++;
    }

    logInfo(`Fetched total ${allItems.length} transactions`);
    return allItems;
  } catch (error) {
    logError('Failed to fetch transactions from SumUp', error);
    throw error;
  }
}


export async function getPayouts(start: string, end: string): Promise<SumUpPayout[]> {
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

export function getSuccessfulCashTransactions(transactions: SumUpTransaction[]) {
  return transactions.filter(
    (t) =>
      t.status === 'SUCCESSFUL' &&
      t.payment_type === 'CASH' &&
      t.type === 'PAYMENT'
  );
}

export async function getTransactionDetails(transaction: SumUpTransaction): Promise<SumUpTransactionDetails> {
  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;

  if (!apiKey || !merchantCode) {
    throw new Error('Missing SUMUP_API_KEY or SUMUP_MERCHANT_CODE in environment');
  }

  try {
    const url = `${baseURL}/v2.1/merchants/${merchantCode}/transactions?id=${transaction.transaction_id}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    return res.data;
  } catch (error) {
    logError(`Failed to fetch transaction details for ID ${transaction.transaction_id}`, error);
    throw error;
  }
}

