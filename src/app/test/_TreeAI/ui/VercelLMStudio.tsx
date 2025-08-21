"use client";
import { useEffect } from "react";
import { useTreeAI } from "../state/useTreeAI";
import { ViewAI } from "./ViewAI";
import { TreeList } from "./TreeList";
import { CodeEditor } from "./CodeEditor";
import { bootup } from "../ai/bootup";
import { DeveloperTeam } from "./DeveloperTeam";
import { AIConversation } from "./AIConversation";

export function VercelLMStudio() {
    useEffect(() => {
        useTreeAI.setState({
            appID: `myApp001`,
        });
    }, []);

    useEffect(() => {
        let ready = async () => {
            await bootup();
        };
        ready();
    }, []);

    let topTab = useTreeAI((r) => r.topTab);
    return (
        <>
            <div className="flex h-full min-w-full overflow-x-auto">
                <div className="h-full w-[350px] shrink-0 overflow-y-scroll">
                    <DeveloperTeam></DeveloperTeam>
                </div>

                <div
                    className="h-full shrink-0 py-3 pl-3"
                    style={{ width: "calc(250px)" }}
                >
                    <div className="h-full w-full rounded-lg border py-3">
                        <TreeList></TreeList>
                    </div>
                </div>

                <div
                    className="h-full shrink-0"
                    style={{ width: "calc(100% - 350px - 250px)" }}
                >
                    {topTab === "chat" && <AIConversation></AIConversation>}
                    {topTab === "code" && <CodeEditor></CodeEditor>}
                    {topTab === "web" && <ViewAI></ViewAI>}
                </div>
            </div>
        </>
    );
}
