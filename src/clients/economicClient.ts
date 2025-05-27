import axios from 'axios';
import { logInfo, logError } from '../utils/logger';

const baseURL = 'https://restapi.e-conomic.com';
const revenueAccount = Number(process.env.ECONOMIC_ACCOUNT_REVENUE!);
const bankAccount = Number(process.env.ECONOMIC_ACCOUNT_BANK!);
const feesAccount = Number(process.env.ECONOMIC_ACCOUNT_SUMUP_FEES!);
const journalId = process.env.ECONOMIC_JOURNAL_ID_DAILY_2025!;
const vatAccount = process.env.ECONOMIC_VAT_CODE_OUTGOING!;

const headers = {
  'X-AppSecretToken': process.env.ECONOMIC_APP_SECRET!,
  'X-AgreementGrantToken': process.env.ECONOMIC_GRANT_TOKEN!,
  'Content-Type': 'application/json'
};

export async function postJournalEntry(date: string, grossAmount: number, feeAmount: number) {
  const netAmount = +(grossAmount - feeAmount).toFixed(2);
  const text = `SumUp payout for ${date}`;

  const payload = {
    accountingYear: {
      year: date.slice(0, 4)
    },
    journal: {
      journalNumber: Number(journalId),
      self: `${baseURL}/journals/${journalId}`
    },
    entries: {
      financeVouchers: [
        // Line 1: Revenue (with VAT)
        {
          date,
          amount: -grossAmount,
          text,
          account: {
            accountNumber: revenueAccount,
            self: `${baseURL}/accounts/${revenueAccount}`
          },
          contraAccount: {
            accountNumber: bankAccount,
            self: `${baseURL}/accounts/${bankAccount}`
          },
          vatAccount: {
            vatCode: vatAccount,
            self: `${baseURL}/vat-accounts/${vatAccount}`
          },
          currency: {
            code: 'DKK',
            self: `${baseURL}/currencies/DKK`
          }
        },

        // Line 2: SumUp fee (no VAT)
        {
          date,
          amount: feeAmount,
          text: `${text} (fee)`,
          account: {
            accountNumber: feesAccount,
            self: `${baseURL}/accounts/${feesAccount}`
          },
          contraAccount: {
            accountNumber: bankAccount,
            self: `${baseURL}/accounts/${bankAccount}`
          },
          currency: {
            code: 'DKK',
            self: `${baseURL}/currencies/DKK`
          }
        },

        // Line 3: Bank receipt (net)
        {
          date,
          amount: netAmount,
          text,
          account: {
            accountNumber: bankAccount, // 5820
            self: `${baseURL}/accounts/${bankAccount}`
          },
          contraAccount: {
            accountNumber: revenueAccount, // 1010
            self: `${baseURL}/accounts/${revenueAccount}`
          },
          currency: {
            code: 'DKK',
            self: `${baseURL}/currencies/DKK`
          }
        }
      ]
    }
  };

  try {
    const res = await axios.post(`${baseURL}/journals/${journalId}/vouchers`, payload, { headers });
    logInfo(`Posted 3-line journal voucher for ${date}`);
    return res.data;
  } catch (error) {
    logError(`Failed to post journal voucher for ${date}`, error);
    throw error;
  }
}

export async function postRefundEntry(date: string, refundAmount: number) {
  const text = `SumUp refund for ${date}`;

  const payload = {
    accountingYear: {
      year: date.slice(0, 4)
    },
    journal: {
      journalNumber: Number(journalId),
      self: `${baseURL}/journals/${journalId}`
    },
    entries: {
      financeVouchers: [
        {
          date,
          amount: -refundAmount,
          text,
          account: {
            accountNumber: revenueAccount,
            self: `${baseURL}/accounts/${revenueAccount}`
          },
          contraAccount: {
            accountNumber: bankAccount,
            self: `${baseURL}/accounts/${bankAccount}`
          },
          vatAccount: {
            vatCode: vatAccount,
            self: `${baseURL}/vat-accounts/${vatAccount}`
          },
          currency: {
            code: 'DKK',
            self: `${baseURL}/currencies/DKK`
          }
        }
      ]
    }
  };

  try {
    const res = await axios.post(`${baseURL}/journals/${journalId}/vouchers`, payload, { headers });
    logInfo(`Posted refund journal entry for ${date}`);
    return res.data;
  } catch (error) {
    logError(`Failed to post refund journal entry for ${date}`, error);
    throw error;
  }
}
