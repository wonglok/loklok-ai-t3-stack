import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { useTreeAI } from "../state/useTreeAI";
import { CodeEditorStream } from "./CodeEditorStream";
import { MagnetIcon, Wand2Icon } from "lucide-react";
import { handleElaboration } from "../ai/handleElaboration";

export function IdeaPad() {
    let atLeastOneWorkerRunning = useTreeAI((r) => r.atLeastOneWorkerRunning);
    let showIdeaPadType = useTreeAI((r) => r.showIdeaPadType);
    let userPrompt = useTreeAI((r) => r.userPrompt);
    let files = useTreeAI((r) => r.files);
    let specFile = files.find((r) => r.path === "/docs/spec.md");
    return (
        <>
            {showIdeaPadType === "ideapad" && (
                <>
                    <div className="h-full w-full">
                        <div
                            className="w-full p-3"
                            style={{ height: `calc(100% - 150px)` }}
                        >
                            <div className="flex h-full w-full items-center justify-center rounded-2xl border">
                                <div>
                                    <div className="mb-3">{`Please describe your idea below 👇`}</div>
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
                            </div>
                        </div>
                        <div
                            className="w-full px-3 pb-3"
                            style={{ height: "150px" }}
                        >
                            <PromptInput
                                onSubmit={(ev) => {
                                    ev.preventDefault();

                                    handleElaboration();
                                    // console.log(123);
                                }}
                                className="relative h-full w-full"
                            >
                                <PromptInputTextarea
                                    value={userPrompt}
                                    placeholder="Say something..."
                                    onChange={(ev) => {
                                        useTreeAI.setState({
                                            userPrompt: ev.target.value,
                                        });
                                    }}
                                    disabled={atLeastOneWorkerRunning}
                                    className="pr-12"
                                />
                                <PromptInputSubmit
                                    status={
                                        atLeastOneWorkerRunning
                                            ? `submitted`
                                            : `ready`
                                    }
                                    disabled={atLeastOneWorkerRunning}
                                    className="absolute right-1 bottom-1"
                                >
                                    <Wand2Icon></Wand2Icon>
                                </PromptInputSubmit>
                            </PromptInput>
                        </div>
                    </div>
                    {/*  */}

                    {/*  */}
                </>
            )}

            {showIdeaPadType === "delta" && (
                <>
                    <div className="h-full w-full">
                        <div
                            className="w-full"
                            style={{ height: `calc(100% - 150px)` }}
                        >
                            <div className="flex h-full w-full items-center justify-center rounded-2xl border">
                                <CodeEditorStream
                                    language="markdown"
                                    text={`${specFile.content}`}
                                    width="100%"
                                    height="100%"
                                ></CodeEditorStream>
                            </div>
                        </div>
                        <div className="w-full p-3" style={{ height: "150px" }}>
                            <PromptInput
                                onSubmit={(ev) => {
                                    ev.preventDefault();

                                    handleElaboration();
                                    // console.log(123);
                                }}
                                className="relative h-full w-full"
                            >
                                <PromptInputTextarea
                                    value={userPrompt}
                                    placeholder="Say something..."
                                    onChange={(ev) => {
                                        useTreeAI.setState({
                                            userPrompt: ev.target.value,
                                        });
                                    }}
                                    disabled={atLeastOneWorkerRunning}
                                    className="pr-12"
                                />
                                <PromptInputSubmit
                                    status={
                                        atLeastOneWorkerRunning
                                            ? `submitted`
                                            : `ready`
                                    }
                                    disabled={atLeastOneWorkerRunning}
                                    className="absolute right-1 bottom-1"
                                ></PromptInputSubmit>
                            </PromptInput>
                        </div>
                    </div>
                    {/*  */}

                    {/*  */}
                </>
            )}
        </>
    );
}
