"use client"

import { useState } from "react"
import { api } from "~/trpc/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog"
import { FileIcon, ChevronLeft, ChevronRight } from "lucide-react"

export default function ErrorReportTable() {
  const [page, setPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { data, isLoading, error } = api.errors.get.useQuery({ page, limit: 10 })

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error.message}</div>

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Сообщение</TableHead>
            <TableHead>Пользователь</TableHead>
            <TableHead>Скриншот</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{new Date(report.date).toLocaleString()}</TableCell>
              <TableCell>{report.message}</TableCell>
              <TableCell>{report.User?.name || 'Неизвестный пользователь'}</TableCell>
              <TableCell>
                {report.filePath && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <FileIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-full p-0 grid justify-center">
                      <img 
                        src={`/api/files/${report.filePath.split('\\').pop()}`} 
                        alt="Screenshot" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Предыдущая
        </Button>
        <span>Страница {page} из {data?.totalPages}</span>
        <Button
          onClick={() => setPage((p) => Math.min(data?.totalPages || p, p + 1))}
          disabled={page === data?.totalPages}
        >
          Следующая
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}