'use client'

import * as XLSX from 'xlsx';
import getRowData from './get-row-data';
import parseStringFromTemplate from './parse-string-from-template';
import fileToArrayBuffer from './file-to-array-buffer';
import config from './config';
import flattenSchedule from './flatten-schedule';
import parseScheduleFromWorkbook  from '~/lib/utils/parse-schedule-from-workbook';


export interface SheetSchedule {
    date: string
    groups: Group[]
}

interface Group {
    title: string
    lessons: Lesson[]
}

interface Lesson {
    title: string
    index: number
    classroom: string
    teacher: string
    group: number | null
}


export default async function parseSchedule(file: File) {
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        throw new Error('неверный тип файла, файл должен быть в формате xlsx')
    }

    const data = await fileToArrayBuffer(file);

    const workbook = XLSX.read(data, { type: 'array' });
    return parseScheduleFromWorkbook(workbook)
}
