"use client";
import { useEffect } from "react";
import { useAI } from "../state/useAI";
import { ViewAI } from "./ViewAI";
import { TreeList } from "./TreeList";
import { CodeEditor } from "./CodeEditor";
import { bootup, SettingsBootUp } from "../ai/bootup";
import { DeveloperTeam } from "./DeveloperTeam";
import { AIConversation } from "./AIConversation";

export function VercelLMStudio() {
    useEffect(() => {
        useAI.setState({
            appID: `myApp001`,
        });
    }, []);

    useEffect(() => {
        let ready = async () => {
            await bootup();
        };
        ready();
    }, []);

    //

    let topTab = useAI((r) => r.topTab);

    return (
        <>
            <SettingsBootUp></SettingsBootUp>
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
                        style={{ height: `calc(100% - 300px)` }}
                        className="w-full rounded-lg border bg-white py-3"
                    >
                        <TreeList></TreeList>
                    </div>
                    <div
                        style={{
                            height: `calc(300px - var(--spacing) * 3)`,
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
                            {topTab === "code" && <CodeEditor></CodeEditor>}
                            {topTab === "web" && <ViewAI></ViewAI>}
                        </div>
                    </div>
                </div>

                {/*  */}
            </div>
        </>
    );
}
//
//
