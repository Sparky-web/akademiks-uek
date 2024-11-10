import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export default createTRPCRouter({
    get: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.session?.user?.isAdmin) throw new Error('Доступ запрещен')

        return (await db.user.findMany({
            include: {
                Group: true,
                Teacher: true,
            }
        })).map(e => {
            delete e.password
            return e
        });
    })
})