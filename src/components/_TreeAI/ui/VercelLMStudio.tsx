"use client";
import { useEffect } from "react";
import { useAI } from "../state/useAI";
import { ViewAI } from "./ViewAI";
import { TreeList } from "./TreeList";
import { CodeEditor } from "./CodeEditor";
import { bootup, SettingsBootUp } from "../ai/bootup";
import { DeveloperTeam } from "./DeveloperTeam";
import { AIConversation } from "./AIConversation";
import { BootUpTaskManager } from "../ai/tasks/_core/MyTaskManager";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function VercelLMStudio({ appID }: { appID: string }) {
    useEffect(() => {
        if (!appID) {
            return;
        }
        let ready = async () => {
            await bootup({ appID });
        };
        ready();
    }, [appID]);

    let topTab = useAI((r) => r.topTab);

    if (!appID) {
        return <>No App ID</>;
    }

    return (
        <>
            <SettingsBootUp></SettingsBootUp>
            <BootUpTaskManager></BootUpTaskManager>
            <div className="h-full w-full">
                <div
                    className="flex w-full justify-between"
                    style={{ height: `calc(45px)` }}
                >
                    <div className="ml-1 flex h-full items-center">
                        <Link href={`/admin`} className="cursor-pointer">
                            <Button>Admin Portal</Button>
                        </Link>
                    </div>
                    <div className="flex h-full items-center text-sm">
                        App Editor
                    </div>
                    <div className="mr-1 flex h-full items-center">
                        <Link
                            target="_blank"
                            href={`/apps/${appID}/run`}
                            className="cursor-pointer"
                        >
                            <Button>Preview</Button>
                        </Link>
                    </div>
                </div>
                <div className="w-full" style={{ height: `calc(100% - 45px)` }}>
                    <div className="flex h-full min-w-full overflow-x-auto bg-gray-200">
                        <div
                            className="h-full"
                            style={{ width: "calc((100% - 280px) * 0.5)" }}
                        >
                            <div className="h-full w-full p-3 pr-0">
                                <div className="size-full rounded-lg bg-white">
                                    <AIConversation></AIConversation>
                                </div>
                            </div>
                        </div>

                        <div
                            className="h-full shrink-0 py-3 pl-3"
                            style={{ width: "calc(280px)" }}
                        >
                            <div
                                style={{ height: `calc(100% - 350px)` }}
                                className="w-full overflow-y-scroll rounded-lg border bg-white py-3"
                            >
                                <TreeList></TreeList>
                            </div>
                            <div
                                style={{
                                    height: `calc(350px - var(--spacing) * 3)`,
                                }}
                                className="mt-3 w-full overflow-y-auto rounded-lg border bg-white py-3"
                            >
                                <DeveloperTeam></DeveloperTeam>
                            </div>
                        </div>

                        <div
                            className="h-full"
                            style={{ width: "calc((100% - 280px) * 0.5)" }}
                        >
                            <div className="h-full w-full p-3">
                                <div className="size-full rounded-lg bg-white">
                                    {topTab === "code" && (
                                        <CodeEditor></CodeEditor>
                                    )}
                                    {topTab === "web" && <ViewAI></ViewAI>}
                                </div>
                            </div>
                        </div>

                        {/*  */}
                    </div>
                </div>
            </div>
        </>
    );
}
//
//
