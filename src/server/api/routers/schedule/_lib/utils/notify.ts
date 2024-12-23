import { db } from "~/server/db";
import sendNotification from "../../../push/send-notification";

export default async function notify(teachers: string[], groups: string[]) {
    const users = await db.user.findMany({
        where: {
            AND: [
                {
                    OR: [
                        {
                            Teacher: {
                                name: {
                                    in: teachers
                                }
                            }
                        },
                        {
                            Group: {
                                title: {
                                    in: groups
                                }
                            }
                        }
                    ]
                },
                {
                    PushSubscription: {
                        some: {} // Ensures at least one PushSubscription exists
                    }
                }
            ]
        },
        include: {
            PushSubscription: true 
        }
    });

    for (let user of users) {
        const title = 'Изменения в расписании'
        const body = user.role === 1 ? `Расписание группы ${user.Group?.title} изменено` : `Расписание ${user.Teacher?.name} изменено`
        await sendNotification(user.id, title, body)
    }
}