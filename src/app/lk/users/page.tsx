'use client'

import { useAppSelector } from "~/app/_lib/client-store";
import InitializationErrorCard from "~/app/_lib/components/errors/initialization-error-card";
import PageTitle from "~/app/_lib/components/page-title";
import { api } from "~/trpc/react";
import UserTable from "./components/table";

export default function Page() {
    const user = useAppSelector(e => e.user?.user)

    if(!user || !user.isAdmin) return <InitializationErrorCard message={"Вы не администратор, доступ запрещен"} />

    return (
        <div className="grid gap-6">
            <PageTitle>Пользователи</PageTitle>

            <UserTable  />
        </div>
    )
}