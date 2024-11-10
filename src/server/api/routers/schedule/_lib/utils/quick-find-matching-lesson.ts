import { LessonParsed } from "~/lib/utils/schedule/flatten-schedule";
import { Lesson } from "~/types/schedule";

export function findMatchingLessons(lessons: Lesson[], lesson: LessonParsed): LessonParsed[] {
    const foundBase: LessonParsed[] = [];

    let left = 0;
    let right = lessons.length - 1;
    let startIndex = -1;

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

    if (startIndex !== -1) {
        for (let i = startIndex; i < lessons.length && lessons[i].start.toString() === lesson.start.toString(); i++) {
            if (lessons[i].end.toString() === lesson.end.toString() &&
                lessons[i]?.Group?.title === lesson.group) {
                foundBase.push(lessons[i]);
            }
        }
    }

    return foundBase;
}