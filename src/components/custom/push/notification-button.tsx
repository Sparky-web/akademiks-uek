"use client"

import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Bell, Check, Loader2 } from 'lucide-react'
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Switch } from "~/components/ui/switch"
import { toast } from "sonner"

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default function NotificationButton() {

    const { mutateAsync: subscribe } = api.push.subscribe.useMutation()
    const { mutateAsync: unsubscribe } = api.push.unsubscribe.useMutation()

    const { mutateAsync: test } = api.push.test.useMutation()

    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        }
    }, [])

    const [isLoading, setIsLoading] = useState(false)

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        })
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
    }

    async function subscribeToPush() {
        setIsLoading(true)
        try {
            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })
            setSubscription(sub)
            const serializedSub = JSON.parse(JSON.stringify(sub))
            console.log(serializedSub)
            await subscribe({
                keys: JSON.stringify(serializedSub.keys),
                endpoint: serializedSub.endpoint
            })
        } catch (e) {
            toast.error('Ошибка подписки на уведомления: ' + e.message)
            console.error(e)
        }
        setIsLoading(false)
    }

    async function unsubscribeFromPush() {
        setIsLoading(true)
        try {
            await subscription?.unsubscribe()
            setSubscription(null)
            await unsubscribe()
        } catch (e) {
            toast.error('Ошибка отписки от уведомлений: ' + e.message)
            console.error(e)
        }
        setIsLoading(false)
    }

    // async function sendTestNotification() {
    //     if (subscription) {
    //         await sendNotification(message)
    //         setMessage('')
    //     }
    // }

    if (!isSupported) {
        return ''
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className={cn(`w-10 h-10 rounded-lg transition-all duration-300 ease-in-out`,
                        subscription
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:text-white"
                            : ""
                    )}
                >
                    <Bell
                        className={`w-5 h-5 ${subscription ? "" : ""
                            }`}
                    />
                    <span className="sr-only">
                        {subscription ? "Disable notifications" : "Enable notifications"}
                    </span>
                </Button>

            </DialogTrigger>
            <DialogContent>
                <DialogTitle className="leading-6">
                    Уведомления об изменениях в расписании
                </DialogTitle>
                <DialogDescription className="leading-5 mt-2">
                    Уведомления будут приходить если:<br />
                    - добавлено расписание на следующую неделю<br />
                    - есть изменения в текущем расписании
                </DialogDescription>
                <div className="flex gap-4 items-center mt-4">
                    <Switch checked={!!subscription}
                        disabled={isLoading}
                        onCheckedChange={(e) => {
                            if (subscription) {
                                unsubscribeFromPush()
                            } else {
                                subscribeToPush()
                            }
                        }} />

                    <div className="text-sm font-semibold flex items-center gap-3">
                        {isLoading &&
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                <span>Загрузка...</span>
                            </>
                        }

                        {!isLoading && subscription &&
                            <>
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="text-green-600">Уведомления включены</span>
                            </>
                        }
                        {!isLoading && !subscription && "Включить уведомления"}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => test()}
                    >
                        Проверить уведомления
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}