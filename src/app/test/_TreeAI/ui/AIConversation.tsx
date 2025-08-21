"use client";

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
    PromptInput,
    PromptInputTextarea,
    PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

import { Response } from "@/components/ai-elements/response";
import { useTreeAI } from "../state/useTreeAI";
import { streamAppBuild } from "../ai/streamAppBuild";
import { CodeEditorStream } from "./CodeEditorStream";
import { useCallback, useEffect } from "react";
import { LoaderIcon } from "lucide-react";

export const AIConversation = () => {
    const userPrompt = useTreeAI((r) => r.userPrompt);
    const atLeastOneWorkerRunning = useTreeAI((r) => r.atLeastOneWorkerRunning);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        streamAppBuild();
    }, []);

    //

    return (
        <div className="h-full w-full p-3">
            <div className="relative size-full rounded-lg border bg-white">
                <div className="flex h-full flex-col rounded-lg">
                    <RenderMessages></RenderMessages>

                    <div className="px-3 py-3 pb-3">
                        <PromptInput
                            onSubmit={handleSubmit}
                            className="relative mt-4 w-full"
                        >
                            {/*  */}
                            <PromptInputTextarea
                                value={userPrompt}
                                placeholder="Say something..."
                                disabled={atLeastOneWorkerRunning}
                                onChange={(ev) => {
                                    useTreeAI.setState({
                                        userPrompt: ev.target.value,
                                    });
                                }}
                                className="pr-12"
                            />

                            <PromptInputSubmit
                                key={atLeastOneWorkerRunning + "bool"}
                                status={
                                    atLeastOneWorkerRunning
                                        ? `submitted`
                                        : `ready`
                                }
                                disabled={
                                    !userPrompt.trim() ||
                                    atLeastOneWorkerRunning
                                }
                                className="absolute right-1 bottom-1"
                            />
                        </PromptInput>
                    </div>
                </div>
            </div>
        </div>
    );
};

function RenderMessages() {
    const uiMessages = useTreeAI((r) => r.uiMessages);
    return (
        <Conversation>
            <ConversationContent>
                {uiMessages.map((message) => (
                    <Message from={message.role} key={message.id}>
                        <MessageContent className="w-[250px]">
                            {message.parts.map((part, i) => {
                                switch (part.type) {
                                    case "text": // we don't use any reasoning or tool calls in this example
                                        return (
                                            <Response
                                                key={`${message.id}-${i}`}
                                            >
                                                {part.text}
                                            </Response>
                                        );
                                    case "reasoning": // we don't use any reasoning or tool calls in this example
                                        return (
                                            <Response
                                                key={`${message.id}-${i}`}
                                            >
                                                {`Reasoning... ${part?.text || ""}`}
                                            </Response>
                                        );
                                    case "data-code-md": // we don't use any reasoning or tool calls in this example
                                        return (
                                            <>
                                                <CodeEditorStream
                                                    key={`${message.id}-${i}`}
                                                    text={part.data}
                                                    language="markdown"
                                                    width="calc(250px - 30px)"
                                                ></CodeEditorStream>
                                            </>
                                        );

                                    case "data-code-md-btn": // we don't use any reasoning or tool calls in this example
                                        return (
                                            <>
                                                <div className="flex justify-end">
                                                    <button
                                                        className="mt-3 cursor-pointer rounded-lg bg-gray-200 p-3"
                                                        onClick={() => {
                                                            //
                                                            useTreeAI.setState({
                                                                //
                                                                currentPath: `${part.data}`,
                                                                topTab: "code",
                                                                //
                                                            });
                                                            //
                                                        }}
                                                    >
                                                        Open File
                                                    </button>
                                                </div>
                                            </>
                                        );

                                    case "data-loading":
                                        return (
                                            <div
                                                className="flex items-center justify-center"
                                                key={`${message.id}-${i}`}
                                            >
                                                <>
                                                    <LoaderIcon className="mr-2 animate-spin antialiased duration-500" />
                                                    <span>
                                                        {`${part.data}`}
                                                    </span>
                                                </>
                                            </div>
                                        );

                                    case "data-welcome": // we don't use any reasoning or tool calls in this example
                                        return (
                                            <div key={`${message.id}-${i}`}>
                                                <div className="mb-3">{`Hi dear, Please tell me what do you want to build: 👇`}</div>
                                                <div>
                                                    <div
                                                        className="mb-2 cursor-pointer rounded-lg border p-3 font-mono text-sm transition-all duration-500 hover:bg-gray-100"
                                                        onClick={() => {
                                                            useTreeAI.setState({
                                                                userPrompt: `Build me a todo list`,
                                                            });
                                                        }}
                                                    >{`Build me a todo list`}</div>

                                                    <div
                                                        className="mb-2 cursor-pointer rounded-lg border p-3 font-mono text-sm transition-all duration-500 hover:bg-gray-100"
                                                        onClick={() => {
                                                            useTreeAI.setState({
                                                                userPrompt: `Build me a expense tracking app`,
                                                            });
                                                        }}
                                                    >{`Build me a expense tracking app`}</div>
                                                </div>
                                            </div>
                                        );
                                    default:
                                        return null;
                                }
                            })}
                        </MessageContent>
                    </Message>
                ))}
            </ConversationContent>
            <ConversationScrollButton />
        </Conversation>
    );
}
