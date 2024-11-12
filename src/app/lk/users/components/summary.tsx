'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart"
import { api } from '~/trpc/react'

export default function UserGroupSummaryChart() {
  const { data, isLoading, error } = api.users.summary.useQuery()

  if (isLoading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-center p-4 text-red-500">Error: {error.message}</div>
  if (!data) return <div className="text-center p-4">No data available</div>

  const chartData = data.items.map((item) => ({
    group: item.title,
    users: item.count,
    // capacity: 25 - item.count // Assuming total capacity is 30
  }))

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Статистика с разбивкой по группам</CardTitle>
        <CardDescription>Максимальное количество пользователей в группе не превышает 25</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            users: {
              label: "Users",
              color: "hsl(var(--chart-1))",
            },
            // capacity: {
            //   label: "Available Capacity",
            //   color: "hsl(var(--chart-2))",
            // },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="group" />
              <YAxis />
              <Bar dataKey="users" stackId="a" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacity" stackId="a" fill="var(--color-capacity)" radius={[0, 0, 4, 4]} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">Всего пользователей</h4>
            <p className="text-2xl font-bold">{data.count}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Всего групп</h4>
            <p className="text-2xl font-bold">{data.items.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}