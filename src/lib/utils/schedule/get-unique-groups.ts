import { LessonParsed } from "./flatten-schedule";

export default function getUniqueGroups(lessons: LessonParsed[]) {
    return [...new Set(lessons.map(lesson => lesson.group))]
}
    