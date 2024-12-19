'use client'
import { useEffect, useState } from "react";
import Dropzone from "~/components/custom/dropzone";
import PageTitle from "~/components/custom/page-title";
import { H2, H4, P } from "~/components/ui/typography";
import parseSchedule from "./_lib/utils/parse-schedule";
import Summary from "./_lib/componetns/summary";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import DifferenceView from "./_lib/componetns/difference-view";
import { useAppSelector } from "~/app/_lib/client-store";
import InitializationErrorCard from "~/components/custom/errors/initialization-error-card";

export default function Page() {
    const user = useAppSelector(e => e.user?.user)

    if (!user || !user.isAdmin) return <InitializationErrorCard message={"Вы не администратор, доступ запрещен"} />

    const [files, setFiles] = useState<File[]>([])
    const [result, setResult] = useState<any>(null)

    const [difference, setDifference] = useState<any>(null)

    const { mutateAsync: updateSchedule, isPending } = api.schedule.update.useMutation()

    const { mutateAsync: getDifference, isPending: isPendingDifference } = api.schedule.difference.useMutation()

    useEffect(() => {
        setDifference(null)
        async function parse() {
            let res = []
            for (let file of files) {
                try {
                    const parsed = await parseSchedule(file)
                    res.push(...parsed)
                } catch (e) {
                    toast.error('Ошибка парсинга файла: ' + file.name + ', ' + e.message)
                }
            }

            console.log(res)
            setResult(res)
        }
        parse()
    }, [files])

    return (
        <div className="grid gap-6 ">
            <PageTitle>
                Управление расписаниями
            </PageTitle>

            <div className="grid lg:grid-cols-2 gap-6 max-w-full">
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <H4>Выберите файлы с расписанием</H4>
                        <P className="text-muted-foreground">Прикрепите файлы в формате xlsx в соответствии с установленным шаблоном</P>
                    </div>
                    <Dropzone files={files} setFiles={setFiles} />
                </div>
            </div>

            {!!result?.length && <Summary scheduleData={result} />}

            {!!result?.length && <Button className="mt-2 max-w-[300px]" variant="default" size="lg" onClick={() => getDifference(result).then(setDifference)}>
                {isPendingDifference && <Loader2 className="animate-spin mr-2" />}
                Предпросмотр изменений
            </Button>}

            {difference && <DifferenceView updated={difference} />}

            {!!result?.length && <Button
                disabled={isPending}
                className="mt-2 max-w-[300px]" variant="default" size="lg" onClick={() => updateSchedule(result).then(
                    () => {
                        toast.success('Расписание успешно обновлено')
                        setResult(null)
                        setFiles([])
                    }
                )}>
                {isPending && <Loader2 className="animate-spin mr-2" />}
                Загрузить расписание
            </Button>}
        </div>
    )
}