import DateTime from "~/lib/utils/datetime"
import { LessonParsed } from "./flatten-schedule";

export default function getPeriod(lessons: LessonParsed[]) {
    let minDate = Infinity
    let maxDate = 0

    lessons.forEach(lesson => {
        maxDate = Math.max(maxDate, new Date(lesson.start).getTime())
        minDate = Math.min(minDate, new Date(lesson.start).getTime())
    })

    return {
        minDate: DateTime.fromMillis(minDate).toJSDate(),
        maxDate: DateTime.fromMillis(maxDate).toJSDate(),
    }
}