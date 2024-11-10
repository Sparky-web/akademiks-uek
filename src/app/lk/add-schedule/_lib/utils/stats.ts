import { LessonParsed } from "../../../../../lib/utils/schedule/flatten-schedule";

export function getUniqueGroups(lessons: LessonParsed[]) {
    const groups = []

    lessons.forEach(lesson => {
        if(!groups.find(e => e.title === lesson.group)) {
            groups.push({
                title: lesson.group,
                lessonsAmount: 1
            })
        } else {
            const group = groups.find(e => e.title === lesson.group)
            group.lessonsAmount++
        }
    })

    return groups
}

