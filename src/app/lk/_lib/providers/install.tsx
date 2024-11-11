'use client'

import { useEffect } from "react"
import { useInstall } from "~/app/_lib/components/install-drawer"
import { isMobile } from "react-device-detect";

export default function InstallProvider({ children }: { children: React.ReactNode }) {
    const { showInstallInstructions, InstallDrawer } = useInstall()

    useEffect(() => {
        const isRejected = window.localStorage.getItem('rejectedInstall')
        if (isRejected) return

        const isStandalone = window.navigator.standalone;
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;


        if (isMobile && !(isStandalone || isInStandaloneMode)) {
            setTimeout(() => {
                showInstallInstructions()
                window.localStorage.setItem('rejectedInstall', 'true')
            }, 10000)
        }
    }, [])

    return (
        <>
            {children}
            <InstallDrawer />
        </>
    )
}