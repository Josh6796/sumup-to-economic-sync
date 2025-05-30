import { Transaction } from "./transaction";

interface TransactionHistoryResponse {
    items: Transaction[];
    links?: TransactionHistoryLink[];
}

interface TransactionHistoryLink {
    rel: string;
    href: string;
}