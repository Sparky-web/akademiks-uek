'use client'
import { useEffect, useState } from "react";
import Dropzone from "~/app/_lib/components/dropzone";
import PageTitle from "~/app/_lib/components/page-title";
import { H2, H4, P } from "~/components/ui/typography";
import parseSchedule from "./_lib/utils/parse-schedule";
import Card, { CardTitle } from "~/app/_lib/components/card";
import { getUniqueGroups } from "./_lib/utils/stats";
import Summary from "./_lib/componetns/summary";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";

export default function Page() {
    const [files, setFiles] = useState<File[]>([])
    const [result, setResult] = useState<any>(null)

    const { mutateAsync: updateSchedule, isPending } = api.schedule.update.useMutation()

    useEffect(() => {
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

            {!!result?.length && <Button className="mt-2 max-w-[300px]" variant="default" size="lg" onClick={() => updateSchedule(result)}>
                {isPending && <Loader2 className="animate-spin mr-2" />}
                Загрузить
            </Button>}
        </div>
    )
}