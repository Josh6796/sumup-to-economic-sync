import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';
import { CashReportRow } from './types/cashReport';


const headerMap: Record<string, keyof CashReportRow> = {
    'Forhandler-ID': 'dealerId',
    'Dato': 'date',
    'UUID': 'uuid',
    'Nr.': 'number',
    'Email': 'email',
    'Begivenhedsnavn': 'event',
    'Årsag': 'reason',
    'Kommentar': 'comment',
    'Indtægt': 'income',
    'Udgift': 'expense',
    'Saldo': 'balance',
    'Forventet beløb': 'expected',
    'Difference': 'difference',
    'Valuta': 'currency',
};

const filePath = process.argv[2];

if (!filePath) {
    console.error('Usage: ts-node src/scripts/previewCashReport.ts <path_to_csv>');
    process.exit(1);
}

(async () => {
    const fileContent = fs.readFileSync(path.resolve(filePath), 'utf-8');

    Papa.parse<CashReportRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => String(headerMap[header.trim()] || header),
        complete: (result) => {
            const eventTotals: Record<string, number> = {};
            let cashTotal = 0;

            for (const row of result.data) {
                const event = row.event || 'UNKNOWN';
                const income = parseFloat((row.income || '0').replace(',', '.'));

                eventTotals[event] = (eventTotals[event] || 0) + income;

                if (event === 'Kontantsalg') {
                    cashTotal += income;
                }
            }

            console.log('\n🧾 Cash Report Event Breakdown:\n');
            for (const [event, total] of Object.entries(eventTotals)) {
                console.log(`  ${event.padEnd(20)}: ${total.toFixed(2)} DKK`);
            }

            console.log(`\n✅ Total to be posted as revenue: ${cashTotal.toFixed(2)} DKK\n`);
        },
        error: (err: any) => {
            console.error('Failed to parse CSV:', err);
            process.exit(1);
        }
    });
})();
