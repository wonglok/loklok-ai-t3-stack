import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "AI Stack + T3 Stack",
    description: "made with love by github.com/wonglok in Hong Kong",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${geist.variable}`}>
            <body className="h-full w-full">
                <TRPCReactProvider>{children}</TRPCReactProvider>
                <Toaster></Toaster>
            </body>
        </html>
    );
}

// https://loklok-t3-ai-stack.vercel.app/app-editor/appID1234
