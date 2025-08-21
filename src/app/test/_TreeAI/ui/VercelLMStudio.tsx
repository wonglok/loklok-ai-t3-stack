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

    return (
        <>
            <div className="flex h-full min-w-full overflow-x-auto">
                <div className="h-full w-[350px] shrink-0 overflow-y-scroll">
                    <DeveloperTeam></DeveloperTeam>
                </div>
                <div className="h-full w-[750px] shrink-0">
                    <AIConversation></AIConversation>
                </div>
                <div className="h-full w-[350px] shrink-0">
                    <TreeList></TreeList>
                </div>

                <CodeEditor></CodeEditor>
                <div className="h-full w-[750px] shrink-0">
                    <ViewAI></ViewAI>
                </div>
            </div>
        </>
    );
}
