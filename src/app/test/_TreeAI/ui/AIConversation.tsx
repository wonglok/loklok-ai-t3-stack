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

import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { useTreeAI } from "../state/useTreeAI";
// import { buildAppDoc } from "../ai/buildAppDoc";
import { asyncGetFreeAI } from "../ai/getFreeAIAsync";
import { toChatStream } from "../ai/toChatStream";
import { bootEngines } from "../ai/bootEngines";
import { CodeEditorStream } from "./CodeEditorStream";
// import { convertToModelMessages } from "ai";

export const AIConversation = () => {
    const userPrompt = useTreeAI((r) => r.userPrompt);

    const { messages, status, setMessages } = useChat({});

    console.log(messages);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await bootEngines();

        //
        let input = userPrompt.trim();
        console.log("11");

        let newUserMessage = {
            id: `${Math.random()}`,
            role: "user",
            parts: [{ type: "text", text: userPrompt }],
        } as any;
        messages.push(newUserMessage);

        setMessages(messages);
        toChatStream({
            model: await asyncGetFreeAI(),
            uiMessages: messages,
            setUIMessages: setMessages,
        });
    };

    return (
        <div className="h-full w-full p-3">
            <div className="relative mx-auto size-full h-full max-w-4xl rounded-lg border p-3">
                <div className="flex h-full flex-col">
                    <Conversation>
                        <ConversationContent>
                            {messages.map((message) => (
                                <Message from={message.role} key={message.id}>
                                    <MessageContent>
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
                                                        <CodeEditorStream
                                                            text={part.data}
                                                            language="markdown"
                                                            key={`${message.id}-${i}`}
                                                        ></CodeEditorStream>
                                                    );

                                                case "data-code-ts": // we don't use any reasoning or tool calls in this example
                                                    return (
                                                        <CodeEditorStream
                                                            text={part.data}
                                                            language="typescript"
                                                            key={`${message.id}-${i}`}
                                                        ></CodeEditorStream>
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

                    <PromptInput
                        onSubmit={handleSubmit}
                        className="relative mx-auto mt-4 w-full max-w-2xl"
                    >
                        <PromptInputTextarea
                            value={userPrompt}
                            placeholder="Say something..."
                            onChange={(ev) => {
                                useTreeAI.setState({
                                    userPrompt: ev.target.value,
                                });
                            }}
                            className="pr-12"
                        />
                        <PromptInputSubmit
                            status={
                                status === "streaming" ? "streaming" : "ready"
                            }
                            disabled={!userPrompt.trim()}
                            className="absolute right-1 bottom-1"
                        />
                    </PromptInput>
                </div>
            </div>
        </div>
    );
};
