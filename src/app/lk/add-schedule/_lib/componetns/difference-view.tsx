"use client"
import { Users } from "lucide-react";
import { DateTime } from "luxon";
import React from "react";
import Card, { CardTitle } from "~/app/_lib/components/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { H4 } from "~/components/ui/typography";
import { cn } from "~/lib/utils";
import { LessonParsed } from "~/lib/utils/schedule/flatten-schedule";
import { Lesson } from "~/types/schedule";

interface DifferenceViewProps {
    updated: {
        from: Lesson | null,
        to: LessonParsed | null
    }[]
}


export default function DifferenceView(props: DifferenceViewProps) {

    console.log(props.updated)

    return (
        <Card>
            <CardTitle>Изменения</CardTitle>
            {!!props.updated.length ?
                <ScrollArea className="grid gap-6 h-[50dvh]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    Текущее
                                </TableHead>
                                <TableHead>
                                    Изменение
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.updated.map((item, index) => (
                                <React.Fragment key={index}>
                                    <TableRow>
                                        {item.from && <TableCell className={cn("border align-top w-[50%]", item.to ? 'bg-amber-500/30' : 'bg-red-500/30')}>
                                            <div className="font-medium text-sm">{item.from.title}</div>
                                            <div className="text-xs ">
                                                {DateTime.fromJSDate(item.from.start).toLocaleString(DateTime.DATE_HUGE)}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {DateTime.fromJSDate(item.from.start).toLocaleString(DateTime.TIME_24_SIMPLE)} - {DateTime.fromJSDate(item.from.end).toLocaleString(DateTime.TIME_24_SIMPLE)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{item.from.Classroom?.name}, {item.from?.Teacher?.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Users className="w-3 h-3" />
                                                {item.from.Groups?.map(e => e.title).join(', ')} {item.from.subgroup &&
                                                    <span> - подгруппа {item.from.subgroup}</span>}
                                            </div>
                                        </TableCell>}
                                        {item.to && <TableCell className="border align-top bg-green-500/20 w-[50%]">
                                            <div className="font-medium text-sm">{item.to.title}</div>
                                            <div className="text-xs ">
                                                {DateTime.fromJSDate(item.to.start).toLocaleString(DateTime.DATE_HUGE)}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {DateTime.fromJSDate(item.to.start).toLocaleString(DateTime.TIME_24_SIMPLE)} - {DateTime.fromJSDate(item.to.end).toLocaleString(DateTime.TIME_24_SIMPLE)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{item.to?.classroom}, {item.to.teacher}</div>

                                            <div className="flex items-center gap-2 mt-1">
                                                <Users className="w-3 h-3" />
                                                {item.to.group}
                                                {item.to.subgroup &&
                                                    <span> - подгруппа {item.to.subgroup}</span>}
                                            </div>
                                        </TableCell>}
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea> : <div className="text-left py-4">Нет изменений</div>
            }
        </Card>
    )
}