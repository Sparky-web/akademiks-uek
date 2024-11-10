import DateTime from "~/lib/utils/datetime"
import { Lesson } from "~/types/schedule"
import useTickUpdate from "./use-tick"

export default function useActiveLessonId(lessons: Lesson[]) {
    useTickUpdate(10000)

    if (lessons.length === 0) return null
    const isToday = DateTime.fromJSDate(lessons[0].start).startOf('day').toJSDate().toISOString() === DateTime.now().startOf('day').toJSDate().toISOString()

    if (!isToday) return null

    let activeLessonId: number | null = null

    for (let i = 0; i < lessons.length; i++) {
        const current = lessons[i]

        if (
            DateTime.fromJSDate(current.start) < DateTime.now()
            && DateTime.fromJSDate(current.end) > DateTime.now()
        ) {
            activeLessonId = current.id
            break
        }

        if (DateTime.fromJSDate(current.start) > DateTime.now()) {
            activeLessonId = current.id
            break
        }
    }

    return activeLessonId
}