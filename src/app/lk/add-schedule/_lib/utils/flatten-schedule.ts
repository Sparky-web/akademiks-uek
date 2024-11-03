import { SheetSchedule } from "./parse-schedule";
import { DateTime, Duration } from "luxon";
import { Lesson } from "~/types/schedule";
import config from "./config";

export type LessonParsed =  {
    index: number
    title: string
    start: Date
    end: Date
    classroom: string
    teacher: string
    group: string
    subgroup: number | null
} | {
    index: number
    title: null
    start: Date
    end: Date
    group: string
}

export default function flattenSchedule(schedule: SheetSchedule[]): LessonParsed[] {
    const lessons: LessonParsed[] = []

    schedule.forEach(day => {
        const startDay = DateTime.fromFormat(day.date, 'dd.MM.yyyy').startOf('day')

        day.groups.forEach(group => {
            group.lessons.forEach(lesson => {
                const start = startDay.plus(Duration.fromISOTime(config.timetable[lesson.index - 1].start))
                const end = startDay.plus(Duration.fromISOTime(config.timetable[lesson.index - 1].end))

                if(lesson.title === null) {
                    lessons.push({
                        index: lesson.index,
                        title: null,
                        start: start.toJSDate(),
                        end: end.toJSDate(),
                        group: group.title
                    })

                    return
                }

                lesson.classroom = lesson.classroom?.toString()?.trim?.() || lesson.classroom || 'Не указан'

                lessons.push({
                    index: lesson.index,
                    title: lesson.title,
                    start: start.toJSDate(),
                    end: end.toJSDate(),
                    classroom: lesson.classroom,
                    teacher: lesson.teacher,
                    group: group.title,
                    subgroup: lesson.group
                })
            })
        });
    })

    return lessons
}
