"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
// import { useToast } from "~/components/ui/use-toast"
import { toast } from "sonner"
// import { trpc } from "~/utils/trpc"
import { api } from "~/trpc/react"
import { AlertCircle } from "lucide-react"

const formSchema = z.object({
    screenshot: z.instanceof(File).optional(),
    description: z.string().min(3, {
        message: "Описание должно содержать не менее 3-х символов.",
    }),
})

export default function ErrorReportModal() {
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
        },
    })

    const errorReportMutation = api.errors.submit.useMutation({
        onSuccess: () => {
            toast.info("Отчет отправлен")
            setIsOpen(false)
            form.reset()
        },
        onError: (error) => {
            toast.error("Ошибка" + error.message)
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append('description', values.description)

        if (values.screenshot) {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(values.screenshot)
            })

            errorReportMutation.mutate({
                description: values.description,
                screenshot: {
                    filename: values.screenshot.name,
                    content: base64.split(',')[1],
                },
            })
        } else {
            errorReportMutation.mutate({
                description: values.description,
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <AlertCircle className="w-4 h-4"/> Сообщить об ошибке
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Сообщить об ошибке</DialogTitle>
                    <DialogDescription className="pt-3">
                        Пожалуйста, опишите проблему и прикрепите скриншот, если это возможно.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="screenshot"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Скриншот</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="text-sm h-10"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => field.onChange(e.target.files?.[0])}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание ошибки</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Опишите проблему..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={errorReportMutation.isLoading}
                            >
                                {errorReportMutation.isLoading ? "Отправка..." : "Отправить"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}