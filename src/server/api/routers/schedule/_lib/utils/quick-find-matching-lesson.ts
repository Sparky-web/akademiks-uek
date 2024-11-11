import { LessonParsed } from "~/lib/utils/schedule/flatten-schedule";
import { Lesson } from "~/types/schedule";

export function findMatchingLessons(lessons: Lesson[], lesson: LessonParsed): LessonParsed[] {
    const foundBase: LessonParsed[] = [];
    let left = 0;
    let right = lessons.length - 1;
    let startIndex = -1;

    // Шаг 1: Используем бинарный поиск для нахождения первого совпадения
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (lessons[mid].start.toString() === lesson.start.toString()) {
            startIndex = mid;
            break;
        } else if (lessons[mid].start < lesson.start) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // Если совпадение найдено, проверяем все элементы слева и справа от начального индекса
    if (startIndex !== -1) {
        // Шаг 2: Проход влево от startIndex
        let i = startIndex;
        while (i >= 0 && lessons[i].start.toString() === lesson.start.toString()) {
            if (lessons[i].end.toString() === lesson.end.toString() &&
                lessons[i]?.Group?.title === lesson.group) {
                foundBase.push(lessons[i]);
            }
            i--;
        }

        // Шаг 3: Проход вправо от startIndex
        i = startIndex + 1;
        while (i < lessons.length && lessons[i].start.toString() === lesson.start.toString()) {
            if (lessons[i].end.toString() === lesson.end.toString() &&
                lessons[i]?.Group?.title === lesson.group) {
                foundBase.push(lessons[i]);
            }
            i++;
        }
    }

    return foundBase;
}