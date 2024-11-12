import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { db } from '~/server/db';

export default createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        start: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        sortBy: z.string().optional().nullable(),
        sortDirection: z.enum(['asc', 'desc']).optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user?.isAdmin) throw new Error('Доступ запрещен');

      const { start, limit, sortBy, sortDirection } = input;

      // Подготовка объекта сортировки
      const orderBy = sortBy
        ? { [sortBy]: sortDirection || 'asc' }
        : undefined;

      // Получение пользователей с пагинацией и сортировкой
      const users = await db.user.findMany({
        skip: start,
        take: limit,
        orderBy,
        include: {
          Group: true,
          Teacher: true,
        },
      });

      // Подсчет общего количества пользователей
      const totalCount = await db.user.count();

      // Удаление пароля из результатов
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return {
        users: sanitizedUsers,
        totalCount,
      };
    }),
  summary: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.isAdmin) throw new Error('Доступ запрещен');

    const groupSummary = await db.user.groupBy({
      by: ['groupId'],
      _count: {
        _all: true,
      },
    });

    const groups = await db.group.findMany({
      orderBy: {
        title: 'asc',
      },
    });

    const totalCount = groupSummary.reduce((acc, group) => acc + group._count._all, 0);

    const items = groupSummary.map(group => {
      const groupInfo = groups.find(g => g.id === group.groupId);
      return {
        title: groupInfo?.title || 'Без группы',
        count: group._count._all,
      };
    });

    return {
      count: totalCount,
      items,
    };
  }),
});