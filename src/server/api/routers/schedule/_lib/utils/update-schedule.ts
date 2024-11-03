import { DateTime } from "luxon";
import { LessonParsed } from "~/app/lk/add-schedule/_lib/utils/flatten-schedule";
import { P } from "~/components/ui/typography";
import translit from "~/lib/utils/translit";
import { db } from "~/server/db";
import pMap from 'p-map';



export default async function updateSchedule(schedule: LessonParsed[]) {
    const groups = await db.group.findMany({
        select: {
            id: true,
            title: true
        }
    })

    const teachers = await db.teacher.findMany({
        select: {
            id: true,
            name: true
        }
    })

    const classrooms = await db.classroom.findMany({
        select: {
            id: true,
            name: true
        }
    })

    async function _updateSchedule(lesson: LessonParsed) {
        let foundGroup = groups.find(group => group.title === lesson.group)
        if (!foundGroup) {
            foundGroup = await db.group.create({
                data: {
                    id: translit(lesson.group),
                    title: lesson.group
                },
                select: {
                    id: true,
                    title: true
                }
            })

            groups.push(foundGroup)
        }

        const foundLesson = await db.lesson.findFirst({
            where: {
                start: lesson.start,
                end: lesson.end,
                Groups: {
                    some: {
                        id: foundGroup.id
                    }
                },
                subgroup: lesson.subgroup || null
            },
            include: {
                Groups: true,
                Teacher: true,
                Classroom: true
            }
        })

        if (foundLesson && lesson.title === null) {
            if (foundLesson.Groups.filter(group => group.id !== foundGroup.id).length === 0) {
                await db.lesson.deleteMany({
                    where: {
                        start: lesson.start,
                        end: lesson.end,
                        Groups: {
                            some: {
                                title: lesson.group
                            }
                        }
                    }
                })
            } else {
                await db.lesson.update({
                    where: {
                        id: foundLesson.id
                    },
                    data: {
                        Groups: {
                            disconnect: {
                                id: foundGroup.id
                            }
                        }
                    },
                    include: {
                        Groups: true
                    }
                })
            }
            return
        }

        if (lesson.title === null) return

        let foundTeacher = teachers.find(teacher => teacher.name === lesson.teacher)
        if (!foundTeacher) {
            foundTeacher = await db.teacher.create({
                data: {
                    id: translit(lesson.teacher),
                    name: lesson.teacher
                },
                select: {
                    id: true,
                    name: true
                }
            })

            teachers.push(foundTeacher)
        }

        let foundClassroom = classrooms.find(classroom => classroom.name === lesson.classroom)
        if (!foundClassroom) {
            foundClassroom = await db.classroom.create({
                data: {
                    name: lesson.classroom
                },
                select: {
                    id: true,
                    name: true
                }
            })

            classrooms.push(foundClassroom)
        }


        if (foundLesson &&
            foundLesson.Teacher?.id === foundTeacher.id &&
            foundLesson.Classroom?.id === foundClassroom.id &&
            foundLesson.Groups.some(group => group.id === foundGroup.id) &&
            lesson.title === foundLesson.title &&
            lesson.index === foundLesson.index && foundLesson.subgroup === lesson.subgroup
        ) return

        if (foundLesson) {
            await db.lesson.update({
                where: {
                    id: foundLesson.id
                },
                data: {
                    title: lesson.title,
                    index: lesson.index,
                    subgroup: lesson.subgroup,
                    Classroom: {
                        connect: {
                            id: foundClassroom.id
                        }
                    },
                    Teacher: {
                        connect: {
                            id: foundTeacher.id
                        }
                    },
                    Days: {
                        connectOrCreate: [
                            {
                                where: {
                                    start_groupId: {
                                        start: DateTime.fromJSDate(lesson.start).startOf('day').toJSDate(),
                                        groupId: foundGroup.id
                                    }
                                },
                                create: {
                                    start: DateTime.fromJSDate(lesson.start).startOf('day').toJSDate(),
                                    Group: {
                                        connect: {
                                            id: foundGroup.id
                                        }
                                    }
                                }
                            },
                            {
                                where: {
                                    start_teacherId: {
                                        start: DateTime.fromJSDate(lesson.start).startOf('day').toJSDate(),
                                        teacherId: foundTeacher.id
                                    }
                                },
                                create: {
                                    start: DateTime.fromJSDate(lesson.start).startOf('day').toJSDate(),
                                    Teacher: {
                                        connect: {
                                            id: foundTeacher.id
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            })
        } else {
            await db.lesson.create({
                data: {
                    title: lesson.title,
                    start: lesson.start,
                    end: lesson.end,
                    index: lesson.index,
                    subgroup: lesson.subgroup,
                    Groups: {
                        connect: {
                            id: foundGroup.id
                        }
                    },
                    Teacher: {
                        connect: {
                            id: foundTeacher.id
                        }
                    },
                    Classroom: {
                        connect: {
                            id: foundClassroom.id
                        }
                    },
                    Days: {
                        connectOrCreate: [
                            {
                                where: {
                                    start_groupId: {
                                        start: DateTime.fromJSDate(lesson.start).startOf('day').toJSDate(),
                                        groupId: foundGroup.id
                                    }
                                },
                                create: {
                                    start: DateTime.fromJSDate(lesson.start).startOf('day').toJSDate(),
                                    Group: {
                                        connect: {
                                            id: foundGroup.id
                                        }
                                    }
                                }
                            },
                            {
                                where: {
                                    start_teacherId: {
                                        start: DateTime.fromJSDate(lesson.start).startOf('day').toJSDate(),
                                        teacherId: foundTeacher.id
                                    }
                                },
                                create: {
                                    start: DateTime.fromJSDate(lesson.start).startOf('day').toJSDate(),
                                    Teacher: {
                                        connect: {
                                            id: foundTeacher.id
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            })
        }
    }

    await pMap(schedule, _updateSchedule, { concurrency: 1 })
}