import { env } from "~/env";
import { db } from "~/server/db";

import axios from 'axios'
import * as cheerio from 'cheerio'
import { google } from 'googleapis'
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

import parseScheduleFromWorkbook from "~/lib/utils/schedule/parse-schedule-from-workbook";
import updateSchedule, { ResultItem } from "~/server/api/routers/schedule/_lib/utils/update-schedule";
import translit from "../translit";
import DateTime from "../datetime";
import { LessonParsed } from "./flatten-schedule";

const scopes = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];

async function authorize() {
    const client_email = env.GOOGLE_API_EMAIL
    const private_key = env.GOOGLE_API_KEY
    const auth = new google.auth.JWT(client_email, null, private_key, scopes);
    return auth;
}

async function fetchPageLinks(url: string) {
    const { data } = await axios.get(url);

    const groups = data.data;

    const startDate = DateTime.now().startOf('week').minus({days: 1}).toISODate()

    const g = groups.map((group: any) => ({
        title: group.name,
        id: group.id,
        url: 'https://xn--j1ab.xn----7sbndgvfca2ar9a.xn--p1ai/api/Rasp?idGroup=' + group.id 
        
        // + '&sdate=' + startDate
    }))

    console.log(g)
    return g
}

async function downloadSpreadsheetAsXLSX(sheetId: string) {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.export({
        auth,
        fileId: sheetId,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }, { responseType: 'stream' });

    return new Promise((resolve, reject) => {
        const chunks = [];

        response.data.on('data', (chunk) => {
            chunks.push(chunk);
        });

        response.data.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const arrayBuffer = new Uint8Array(buffer).buffer;
            resolve(arrayBuffer);
        });

        response.data.on('error', (err) => {
            reject(`Error downloading file: ${err.message}`);
        });
    });
}

export default async function parseBackground() {
    const startedAt = new Date()

    console.log('Triggered parseBackground')
    const config = await db.config.findFirst({
        select: {
            parseSpreadsheetPageUrl: true,
            parseInterval: true
        }
    })

    if (!config) throw new Error('Запись конфигурации в БД не обнаружена')

    let links = await fetchPageLinks(config.parseSpreadsheetPageUrl);

    const reports: ResultItem[] = []

    for (const link of links) {
        const groupId = link.id;

        try {
            const { data } = await axios.get(link.url)

            const lessonParsed: LessonParsed[] = data.data.rasp.map((lesson: any) => ({
                title: lesson['дисциплина'],
                index: lesson['номерЗанятия'],
                start: new Date(lesson['датаНачала']),
                end: new Date(lesson['датаОкончания']),
                group: link.title,
                subgroup: null,
                classroom: lesson['аудитория'] || 'Не указана',
                teacher: lesson['преподаватель'] || 'Не указан',
            }))

            console.log(`Найдено пар: ${lessonParsed.length}`)

            if (lessonParsed.length) {
                const report = await updateSchedule(lessonParsed)
                reports.push(...report)
            }
            console.log(`Обновлено расписание: ${groupId}`)
        } catch (e) {
            console.error(`Ошибка при обновлении расписания: ${groupId}`, e)
        }
    }

    await db.report.create({
        data: {
            startedAt: startedAt,
            endedAt: new Date(),
            result: JSON.stringify(reports.slice(0, 100))
        }
    })
}

