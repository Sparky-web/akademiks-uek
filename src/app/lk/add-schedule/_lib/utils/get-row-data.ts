import { WorkSheet } from "xlsx";
import * as XLSX from 'xlsx';

export default function getRowData(worksheet: WorkSheet, row: number) {
    const rowData: { [key: string]: any } = {};

    if (!worksheet['!ref']) {
        throw new Error('не удалось получить данные из ячейки')
    }

    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col });
        const cell = worksheet[cellAddress];
        const columnLetter = XLSX.utils.encode_col(col);

        // if(typeof columnLetter !== 'string' || !rowData[columnLetter]) continue

        rowData[columnLetter] = cell ? cell.v : null; // сохраняем значение ячейки или null, если ячейка пуста
    }

    return rowData;
}
