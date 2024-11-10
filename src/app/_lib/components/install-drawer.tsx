'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from "~/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "~/components/ui/drawer"
import { ArrowDownToLine, Zap, Wifi, Clock } from "lucide-react"

export function useInstall() {
  const [isOpen, setIsOpen] = useState(false)

  const showInstallInstructions = useCallback(() => {
    setIsOpen(true)
  }, [])

  const InstallDrawer = useCallback(() => {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Установите Академикс</DrawerTitle>
            <DrawerDescription>Получите быстрый доступ и дополнительные возможности</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <InstallInstructions />
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Закрыть</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }, [isOpen])

  return { showInstallInstructions, InstallDrawer }
}

function InstallInstructions() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Отслеживаем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA установлено');
      } else {
        console.log('Пользователь отклонил установку PWA');
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Как установить:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Нажмите на кнопку "Поделиться" <span className="text-muted-foreground">(iOS)</span> или "⋮" <span className="text-muted-foreground">(Android)</span> в вашем браузере</li>
          <li>Выберите "На экран «Домой»" или "Установить приложение"</li>
          <li>Нажмите "Добавить" или "Установить"</li>
        </ol>
      </div>

      {showInstallPrompt && <div className="flex items-center justify-center p-4 bg-muted rounded-lg cursor-pointer" onClick={handleInstallClick}>
        <ArrowDownToLine className="h-12 w-12 text-primary" />
        <span className="ml-2 text-sm font-medium">Нажмите здесь, чтобы установить</span>
      </div>}

      <p className="text-sm text-muted-foreground mb-2">
        После установки вы сможете открывать "Академикс" одним касанием, прямо с главного экрана вашего устройства!
      </p>
    </div>
  )
}