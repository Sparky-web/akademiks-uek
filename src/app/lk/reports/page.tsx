'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { Button } from "~/components/ui/button"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
// import { api } from '@/utils/api'
import { api } from '~/trpc/react'
import { DateTime } from "luxon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"

interface ResultItem {
    type: "add" | "update" | "delete"
    status: "success" | "error"
    item?: Lesson | LessonParsed
    inputItem?: Lesson | LessonParsed
    error?: string
}

interface Lesson {
    id: number
    title: string
    createdAt: Date
    updatedAt: Date
    start: Date
    end: Date
    index: number
    subgroup: number | null
    teacherId: string | null
    groupId: string | null
    startDay: Date
    classroomId: number | null
}

interface LessonParsed {
    index: number
    start: Date
    end: Date
    group: string
    subgroup: number | null
    title: string | null
    classroom?: string
    teacher?: string
}

function formatDate(date: Date) {
    return DateTime.fromJSDate(date).toFormat('dd.MM.yyyy HH:mm')
}

function formatTime(date: Date) {
    return DateTime.fromJSDate(date).toFormat('HH:mm')
}

function translateType(type: string) {
    const translations = {
        add: 'Добавление',
        update: 'Обновление',
        delete: 'Удаление'
    }
    return translations[type] || type
}

function LessonInfo({ lesson }: { lesson: Lesson | LessonParsed }) {
    const isLessonParsed = 'group' in lesson
    console.log(lesson)

    return (
        <div className="space-y-1 text-sm">
            <p className="font-bold">{isLessonParsed ? lesson.group : lesson.groupId}</p>
            <p>{isLessonParsed ? lesson.teacher : lesson.Teacher?.name}</p>
            <p>{lesson.title}</p>
            <p>{formatDate(new Date(lesson.start))}</p>
            <p>{isLessonParsed ? lesson.classroom : lesson.Classroom?.title}</p>
            {!isLessonParsed && <p>ID: {lesson.id}</p>}
        </div>
    )
}

function DetailedReportModal({ isOpen, onClose, report }) {
    const results: ResultItem[] = JSON.parse(report.result)

    const uniqueGroups = new Set(results.flatMap(e => [e.inputItem?.group || e.inputItem?.Group?.title, e.item?.group || e.item?.Group?.title]).filter(e => e))

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Детальный отчет</DialogTitle>
                </DialogHeader>
                <div className='flex gap-3 flex-wrap'>
                    {Array.from(uniqueGroups).map(group => (
                        <div key={group} className='bg-muted rounded-md px-2 py-1 text-sm'>{group}</div>
                    ))}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Тип</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>До</TableHead>
                            <TableHead>После</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((result, index) => (
                            <TableRow key={index}>
                                <TableCell>{translateType(result.type)}</TableCell>
                                <TableCell>{result.status === 'success' ? 'Успешно' : 'Ошибка'}</TableCell>
                                <TableCell>
                                    {result.inputItem && <LessonInfo lesson={result.inputItem} />}
                                </TableCell>
                                <TableCell>
                                    {result.item && <LessonInfo lesson={result.item} />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}


export default function ReportTable() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const page = parseInt(searchParams.get('page') || '1')
    const sortBy = searchParams.get('sortBy') || 'startedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const [selectedReport, setSelectedReport] = useState(null)

    const { data: reports } = api.reports.get.useQuery({
        page,
        limit: 10,
        sortBy,
        sortOrder,
    })

    const handleSort = (column: string) => {
        const newSortOrder = column === sortBy && sortOrder === 'asc' ? 'desc' : 'asc'
        router.push(`?page=${page}&sortBy=${column}&sortOrder=${newSortOrder}`)
    }

    const handlePageChange = (newPage: number) => {
        router.push(`?page=${newPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
    }

    const renderSortIcon = (column: string) => {
        if (column !== sortBy) return null
        return sortOrder === 'asc' ? <ChevronLeft className="ml-2 h-4 w-4" /> : <ChevronRight className="ml-2 h-4 w-4" />
    }

    const calculateSummary = (result: string) => {
        const items: ResultItem[] = JSON.parse(result)
        const success = items.filter(item => item.status === 'success').length
        const error = items.filter(item => item.status === 'error').length
        const total = items.length
        return { success, error, total }
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Отчеты</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-left">ID</TableHead>
                        <TableHead className="text-left">
                            <Button variant="ghost" onClick={() => handleSort('startedAt')} className="p-0 font-semibold text-sm">
                                Начало {renderSortIcon('startedAt')}
                            </Button>
                        </TableHead>
                        <TableHead className="text-left">
                            <Button variant="ghost" onClick={() => handleSort('endedAt')} className="p-0 font-semibold text-sm">
                                Окончание {renderSortIcon('endedAt')}
                            </Button>
                        </TableHead>
                        <TableHead className="text-left">Успешно</TableHead>
                        <TableHead className="text-left">Ошибки</TableHead>
                        <TableHead className="text-left">Всего</TableHead>
                        <TableHead className="text-left">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports?.map((report) => {
                        const summary = calculateSummary(report.result)
                        return (
                            <TableRow key={report.id} className="text-sm">
                                <TableCell className="font-medium">{report.id}</TableCell>
                                <TableCell>{formatDate(report.startedAt)}</TableCell>
                                <TableCell>{formatDate(report.endedAt)}</TableCell>
                                <TableCell>{summary.success}</TableCell>
                                <TableCell>{summary.error}</TableCell>
                                <TableCell>{summary.total}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
                <Button variant="ghost" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>Страница {page}</span>
                <Button variant="ghost" onClick={() => handlePageChange(page + 1)} disabled={reports?.length < 10}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            {selectedReport && (
                <DetailedReportModal
                    isOpen={!!selectedReport}
                    onClose={() => setSelectedReport(null)}
                    report={selectedReport}
                />
            )}
        </div>
    )
}