# SumUp to e-conomic Integration

This project synchronizes transaction and payout data from [SumUp](https://sumup.com/) to [e-conomic](https://www.e-conomic.com/) for accounting automation. It fetches transactions and payouts from SumUp, processes and summarizes them, and posts the relevant journal entries to e-conomic.

## Features

- Fetches transactions and payouts from SumUp API
- Summarizes daily and monthly revenue, cash, and refunds
- Posts journal entries to e-conomic via API
- Imports product and transaction data into a local SQLite database using Prisma
- Supports category-based revenue reporting

## Project Structure

- `src/clients/`: API clients for SumUp and e-conomic
- `src/services/`: Business logic for syncing and importing data
- `src/jobs/`: CLI scripts for running sync and import jobs
- `src/types/`: Type definitions for SumUp and e-conomic data
- `src/utils/`: Utility functions (logging, date, caching, etc.)
- `prisma/`: Prisma schema and SQLite database

## Prerequisites

- Node.js 20+
- [SumUp API credentials](https://developer.sumup.com/)
- [e-conomic API credentials](https://www.e-conomic.com/developer)
- [Prisma CLI](https://www.prisma.io/docs/getting-started)

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env` and fill in your credentials:
   ```
   SUMUP_API_KEY=...
   SUMUP_MERCHANT_CODE=...
   ECONOMIC_APP_SECRET=...
   ECONOMIC_GRANT_TOKEN=...
   ECONOMIC_ACCOUNT_BANK=...
   ECONOMIC_ACCOUNT_CASH_REGISTER=...
   ECONOMIC_ACCOUNT_REVENUE=...
   ECONOMIC_ACCOUNT_SUMUP_FEES=...
   ECONOMIC_ACCOUNT_SUMUP_CLEARING=...
   ECONOMIC_JOURNAL_ID_DAILY_2025=...
   ECONOMIC_VAT_CODE_OUTGOING=...
   ```

3. **Set up the database:**
   ```sh
   npx prisma generate
   npx prisma migrate deploy
   ```

## Usage

### Sync Daily Data

Sync today's data:
```sh
npx ts-node src/jobs/syncDailyAuto.ts
```

Sync for a specific date range:
```sh
npx ts-node src/jobs/syncDaily.ts 2024-05-01 2024-05-31
```

Sync only cash transactions:
```sh
npx ts-node src/jobs/syncCash.ts 2024-05-01 2024-05-31
```

### Import Transactions and Products

Import transactions into the local database:
```sh
npx ts-node src/jobs/importTransactions.ts 2024-05-01 2024-05-31
```

Import products from CSV:
```sh
npx ts-node src/jobs/importProducts.ts
```

### Get Revenue by Category

```sh
npx ts-node src/jobs/getRevenueByCategory.ts 2024-05-01 2024-05-31 "Bread"
```

## Development

- Lint code: `npm run lint`
- Build: `npm run build`
- Start (after build): `npm start`

## License

ISC

---

**Note:** This project is not affiliated with SumUp or e-conomic. Use at your own risk.