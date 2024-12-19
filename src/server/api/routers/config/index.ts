import { createTRPCRouter, protectedProcedure } from "../../trpc";
import {z} from "~/lib/utils/zod-russian";


export default createTRPCRouter({
    get: protectedProcedure.query(({ctx}) => {
        return ctx.db.config.findFirst()
    }),
    update: protectedProcedure.input(z.object({
        parseSpreadsheetPageUrl: z.string().optional(),
        parseInterval: z.number().optional()
    })).mutation(async ({ctx, input}) => {
        const found = await ctx.db.config.findFirst()

        if(!found) {
            return ctx.db.config.create({
                data: {
                    ...input
                }
            })
        }

        return ctx.db.config.update({
            where: {
                id: "config",
            },
            data: {
                ...input
            }
        })
    })
})