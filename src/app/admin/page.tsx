"use client";
import { api } from "@/trpc/react";
// import { auth } from "@/server/auth";
// import { api, HydrateClient } from "@/trpc/server";
import Link from "next/link";
import { MyApps } from "./_dash/MyApps";
import { ListApps } from "./_dash/ListApps";
// import { redirect } from "next/navigation";
// import { ButtonYo } from "./_core/llm-calls/createStudy";
// import { ButtonOpenAI } from "./_core/llm-calls/buttonOpenAI";
export default function HomePage() {
    return (
        <>
            <div className="p-4">
                <div className="grid auto-rows-min gap-4">
                    <div className="bg-muted/50 aspect-video rounded-xl">
                        <MyApps></MyApps>
                        <ListApps></ListApps>
                    </div>
                </div>
                <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
            </div>
        </>
    );
}
