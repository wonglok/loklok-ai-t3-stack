"use client";
import { useEffect } from "react";
import { useTreeAI } from "../state/useTreeAI";
import { ViewAI } from "./ViewAI";
import { TreeList } from "./TreeList";
import { CodeEditor } from "./CodeEditor";
import { ConversationAI } from "./ConversationAI";
import { bootup } from "../ai/bootup";
import { onRun } from "../ai/onRun";
import { DeveloperTeam } from "./DeveloperTeam";

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

    return (
        <>
            <div className="flex h-full min-w-full overflow-x-auto">
                <div className="h-full w-[350px] shrink-0">
                    <ConversationAI></ConversationAI>
                </div>
                <div className="h-full w-[350px] shrink-0">
                    <DeveloperTeam></DeveloperTeam>
                </div>
                <div className="h-full w-[350px] shrink-0">
                    <TreeList></TreeList>
                </div>
                <div className="h-full w-[650px] shrink-0">
                    <div className="h-[70%] w-full bg-gray-100">
                        <CodeEditor></CodeEditor>
                    </div>
                    <div className="h-[30%] w-full">
                        <ViewAI></ViewAI>
                    </div>
                </div>
            </div>
        </>
    );
}
