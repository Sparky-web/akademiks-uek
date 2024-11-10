'use client'

import { useState } from 'react'
import { DateTime } from 'luxon'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { User } from '~/types/user'


const columns = [
  { key: 'name', label: 'Имя' },
  { key: 'email', label: 'Эл. почта' },
  { key: 'role', label: 'Роль' },
  { key: 'isAdmin', label: 'Админ' },
  { key: 'group', label: 'Группа' },
  { key: 'teacher', label: 'Преподаватель' },
]

export default function UserTable(props: { users: User[] }) {
  const [users] = useState<User[]>(props.users)

  const getRoleText = (role: number) => {
    return role === 1 ? 'Студент' : role === 2 ? 'Преподаватель' : 'Неизвестно'
  }


  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="w-full bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleText(user.role)}</TableCell>
                <TableCell>{user.isAdmin ? 'Да' : 'Нет'}</TableCell>
                <TableCell>{user.Group?.title}</TableCell>
                <TableCell>{user.Teacher?.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}