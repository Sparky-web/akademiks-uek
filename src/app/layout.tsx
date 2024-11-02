import "~/styles/globals.css";

import { Montserrat } from 'next/font/google';

import { type Metadata } from "next";

import { Toaster } from "~/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import { ReduxProvider } from "./_lib/context/redux";

import { api } from "~/trpc/server";
// import { Provider } from "react-redux";
// import store from "~/client-store";

export const metadata: Metadata = {
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const montserrat = Montserrat({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  // await api.schedule.generate({groupId: 'is-313'})

  return (
    <html lang="ru" className={`${montserrat.className}`}>
      <head>
        <title>
          Академикс — расписание УРТК
        </title>
        <meta name="description" content="Платформа Свердловской области для просмотра расписания СПО. Расписания уральского радиотехнического колледжа им. А.С. Попова." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" data-meta-dynamic="true"></meta>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <TRPCReactProvider>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
