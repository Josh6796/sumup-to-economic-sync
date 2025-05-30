// src/services/cashReportService.ts

import fs from 'fs';
import Papa from 'papaparse';
import { CashReportRow } from '../types/cashReport';

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

export async function getMonthlyCashIncomeFromCsv(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => headerMap[header.trim()] || header,
            complete: (result: Papa.ParseResult<CashReportRow>) => {
                const eventTotals: Record<string, number> = {};
                let total = 0;

                for (const row of result.data) {
                    const event = row.event || 'UNKNOWN';
                    const rawIncome = row.income?.replace(',', '.');
                    const income = parseFloat(rawIncome || '0');

                    eventTotals[event] = (eventTotals[event] || 0) + income;

                    if (event === 'Kontantsalg') {
                        total += income;
                    }
                }

                console.log('Cash report summary by event:');
                Object.entries(eventTotals).forEach(([event, amt]) =>
                    console.log(`  ${event}: ${amt.toFixed(2)} DKK`)
                );

                resolve(+total.toFixed(2));
            },
            error: reject
        });
    });
}
