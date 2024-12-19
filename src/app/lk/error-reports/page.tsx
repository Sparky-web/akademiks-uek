"use client"

import { useAppSelector } from "~/app/_lib/client-store"
import InitializationErrorCard from "~/components/custom/errors/initialization-error-card"
import PageTitle from "~/components/custom/page-title"
import Reports from "./_lib/components/reports"

export default function ErrorReportTable() {
  const user = useAppSelector(e => e.user?.user)

  if (!user || !user.isAdmin) return <InitializationErrorCard message={"Вы не администратор, доступ запрещен"} />

  return (<div className="grid gap-6">
    <PageTitle>Отчеты об ошибках</PageTitle>
    <Reports />
  </div>)
}