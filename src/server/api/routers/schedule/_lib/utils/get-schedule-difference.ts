import { LessonParsed } from "~/lib/utils/schedule/flatten-schedule";
import getPeriod from "~/lib/utils/schedule/get-period";
import getUniqueGroups from "~/lib/utils/schedule/get-unique-groups";
import { db } from "~/server/db";
import { findMatchingLessons } from "./quick-find-matching-lesson";

export default async function getScheduleDifference(schedule: LessonParsed[]) {
    const groups = getUniqueGroups(schedule)
    const { minDate, maxDate } = getPeriod(schedule)

    const fetched = await db.lesson.findMany({
        where: {
            start: {
                gte: minDate,
                lte: maxDate
            },
            Group: {
                title: {
                    in: groups
                }
            },
        },
        orderBy: {
            start: 'asc',
        },
        include: {
            Group: true,
            Teacher: true,
            Classroom: true
        }
    })

    const updated = []

    for (let lesson of schedule) {
        const foundBase = findMatchingLessons(fetched, lesson)

        if (foundBase.length && lesson.title === null && !lesson.subgroup) {
            updated.push(...foundBase.map(e => ({ from: e, to: null })))
            continue
        } else if (foundBase.length && lesson.title === null && foundBase.find(e => e.subgroup === lesson.subgroup)) {
            updated.push({ from: foundBase.find(e => e.subgroup === lesson.subgroup), to: null })
        }

        if (lesson.title === null) {
            continue
        }

        const foundExact = fetched.find(l => {
            return l.start.toString() === lesson.start.toString() && l.end.toString() === lesson.end.toString() &&
                l.title === lesson.title &&
                l.Group?.title === lesson.group &&
                l.Teacher?.name === lesson.teacher &&
                l?.Classroom?.name === lesson.classroom &&
                l.subgroup === lesson.subgroup
        })

        if (foundExact) {
            continue
        }

        if (foundBase.find(e => e.subgroup) && lesson.subgroup) {
            updated.push({ from: foundBase.find(e => e.subgroup === lesson.subgroup), to: lesson })
            continue
        } else {
            updated.push({ from: foundBase[0], to: lesson })
            continue
        }
    }

    return updated
}