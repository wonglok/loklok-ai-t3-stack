"use client";
import { useEffect } from "react";
import { useTreeAI } from "../state/useTreeAI";
import { ViewAI } from "./ViewAI";
import { TreeList } from "./TreeList";
import { CodeEditor } from "./CodeEditor";
import { bootup } from "../ai/bootup";
import { onRun } from "../ai/onRun";
import { DeveloperTeam } from "./DeveloperTeam";
import { AIConversation } from "./AIConversation";
import { IdeaPad } from "./IdeaPad";

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
                <div className="h-full w-[350px] shrink-0 overflow-y-scroll">
                    <DeveloperTeam></DeveloperTeam>
                </div>
                <div className="h-full w-[750px] shrink-0">
                    <IdeaPad></IdeaPad>
                </div>
                <div className="h-full w-[750px] shrink-0">
                    <AIConversation></AIConversation>
                </div>
                <div className="h-full w-[350px] shrink-0">
                    <TreeList></TreeList>
                </div>
                <div className="relative h-full w-[650px] shrink-0">
                    <div className="absolute top-0 left-0 h-full w-full">
                        <CodeEditor></CodeEditor>
                    </div>
                    <div className="absolute top-0 left-0 h-full w-full">
                        <ViewAI></ViewAI>
                    </div>
                </div>
            </div>
        </>
    );
}
