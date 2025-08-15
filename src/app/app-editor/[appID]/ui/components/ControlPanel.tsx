import { useGenAI } from "../../useGenAI";
import { Button } from "@/components/ui/button";
import {
    // DownloadCloudIcon,
    // FileIcon,
    // Loader2Icon,
    // SendIcon,

    HammerIcon,
    LoaderIcon,
    StopCircleIcon,
} from "lucide-react";
import { WebLLMAppClient } from "../util/WebLLMAppClient";

//
// import { Response } from "@/components/ai-elements/response";
// import { Scroller } from "./Scroller";
//
import {
    PromptInputModelSelect,
    PromptInputModelSelectContent,
    PromptInputModelSelectItem,
    PromptInputModelSelectTrigger,
    PromptInputModelSelectValue,
    //
    // PromptInputSubmit,
    // PromptInputTextarea,
    // PromptInputToolbar,
    // PromptInputTools,
    // PromptInput,
    // PromptInputButton,
} from "@/components/ai-elements/prompt-input";

// import { PreviewPanelLoader } from "./PreviewPanelLoader";
// import { Conversation } from "@/components/ai-elements/conversation";
// import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
// import { ServerAIClient } from "../util/ServerAIClient";
// import * as webllm from "@mlc-ai/web-llm";
// import { LoaderDisplay } from "@/game/GameCanvas";

//https://github.com/Aider-AI/aider/blob/main/aider/coders/udiff_prompts.py#L17C1-L18C1
//https://github.com/Aider-AI/aider/blob/main/aider/coders/udiff_prompts.py#L17C1-L18C1
//https://github.com/Aider-AI/aider/blob/main/aider/coders/udiff_prompts.py#L17C1-L18C1
//https://github.com/Aider-AI/aider/blob/main/aider/coders/udiff_prompts.py#L17C1-L18C1

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import * as pathUtil from "path";
import { format } from "date-fns";
import { CodePod } from "../util/CodePod";

let getLang = (filename: string) => {
    if (pathUtil.extname(filename) === ".json") {
        return "json";
    } else if (pathUtil.extname(filename) === ".js") {
        return "javascript";
    } else {
        return "markdown";
    }
};

let selectFile = ({
    file,
    total,
    index,
}: {
    file: any;
    total: number;
    index: number;
}) => {
    useGenAI.setState({
        expandID: `${file.path}`,
    });

    let docs = document.querySelector("#docs");
    if (docs) {
        let ttt = setInterval(() => {
            docs.scrollLeft += 40;
        });

        setTimeout(() => {
            clearInterval(ttt);
        }, 1000);
    }

    // if (expandID === `${file.path}` || (expandID === "" && index === 0)) {
    //     if (expandID === `${file.path}`) {
    //         useGenAI.setState({
    //             expandID: ``,
    //         });
    //     }

    // } else {

    // }
};

function MonacoEditor({
    path,
    value,
    height,
    defaultLanguage,
    onChange = () => {},
}: {
    path: string;
    value: string;
    height: string;
    defaultLanguage?: string;
    onChange?: (v: string) => void;
}) {
    let llmStatus = useGenAI((r) => r.llmStatus);
    let files = useGenAI((r) => r.files);
    let sortedFiles = files?.slice().sort(sortDate).reverse();
    let track = sortedFiles[0]?.content === value;

    let [editor, setEditor] = useState<any>();

    useEffect(() => {
        if (editor) {
            editor.updateOptions({ wordWrap: false });
        }
    }, [editor]);

    //

    useEffect(() => {
        if (llmStatus !== "writing") {
        } else {
            if (track) {
                if (editor) {
                    editor.revealLine(editor.getModel().getLineCount());

                    return () => {};
                }
            } else {
                if (editor) {
                    editor.revealLine(0);

                    return () => {};
                }
            }
        }
    }, [llmStatus, editor, value]);

    return (
        <Editor
            path={path}
            height={height}
            onMount={(editor, monaco) => {
                setEditor(editor);
            }}
            language={
                llmStatus === "writing" && track && path.includes(".js")
                    ? "markdown"
                    : defaultLanguage
            }
            value={value}
            onChange={onChange}
        ></Editor>
    );
}

let sortDate = (a: any, b: any) => {
    let dateA = new Date(a.updatedAt).getTime();
    let dateB = new Date(b.updatedAt).getTime();

    if (dateA > dateB) {
        return 1;
    } else if (dateA < dateB) {
        return -1;
    } else {
        return 0;
    }
};

export function ControlPanel() {
    //
    let appID = useGenAI((r) => r.appID);

    //
    let currentModel = useGenAI((r) => r.currentModel);
    let prompt = useGenAI((r) => r.prompt);
    let models = useGenAI((r) => r.models);
    let llmStatus = useGenAI((r) => r.llmStatus);
    let setupLLMProgress = useGenAI((r) => r.setupLLMProgress);
    let expandID = useGenAI((r) => r.expandID);

    let stopFunc = useGenAI((r) => r.stopFunc);
    let files = useGenAI((r) => r.files);

    useEffect(() => {
        if (!files) {
            return;
        }
        let sortedFiles = files?.slice().sort(sortDate).reverse();
        if (llmStatus === "writing") {
            if (sortedFiles?.length === 1) {
                useGenAI.setState({
                    expandID: sortedFiles[0]?.path,
                });
            } else {
                if (sortedFiles[0]) {
                    useGenAI.setState({
                        expandID: sortedFiles[0]?.path,
                    });
                }
            }
        }
    }, [llmStatus, files?.length]);

    return (
        <>
            <div className="relative flex h-full w-full text-sm">
                <div className="h-full w-[350px] shrink-0 bg-gray-300 p-3">
                    <form
                        onSubmit={(ev) => {
                            ev.preventDefault();
                        }}
                        onKeyUpCapture={(ev) => {
                            ev.stopPropagation();
                        }}
                        className="h-full w-full"
                    >
                        <textarea
                            style={{ height: `calc(100% - 35px - 10px)` }}
                            className="mb-[5px] w-full resize-none rounded-xl bg-white p-3 text-sm"
                            onChange={(e) => {
                                //
                                useGenAI.setState({
                                    prompt: e.target.value,
                                });
                                //
                            }}
                            value={prompt}
                        />
                        <div className="flex h-[35px] justify-end">
                            {llmStatus === "writing" && (
                                <>
                                    <Button
                                        onClick={() => {
                                            stopFunc();
                                        }}
                                        className="h-[35px] cursor-pointer bg-gray-800"
                                    >
                                        {`Stop Building`}
                                        <StopCircleIcon className="animate-spin"></StopCircleIcon>
                                    </Button>
                                </>
                            )}

                            {llmStatus === "downloading" && (
                                <>
                                    <Button className="h-[35px] bg-gray-500">
                                        {`Loading AI Engine...`}
                                        <LoaderIcon className="animate-spin"></LoaderIcon>
                                    </Button>
                                </>
                            )}

                            {llmStatus === "init" && (
                                <>
                                    <div className="mr-2 rounded-lg bg-white">
                                        <PromptInputModelSelect
                                            onValueChange={(value) => {
                                                useGenAI.setState({
                                                    currentModel: value,
                                                });
                                            }}
                                            value={currentModel}
                                        >
                                            <PromptInputModelSelectTrigger>
                                                <PromptInputModelSelectValue />
                                            </PromptInputModelSelectTrigger>
                                            <PromptInputModelSelectContent>
                                                {models.map((model) => (
                                                    <PromptInputModelSelectItem
                                                        key={model.value}
                                                        value={model.value}
                                                    >
                                                        {model.key}
                                                    </PromptInputModelSelectItem>
                                                ))}
                                            </PromptInputModelSelectContent>
                                        </PromptInputModelSelect>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            WebLLMAppClient.buildApp({
                                                userPrompt: prompt,
                                                currentModel: currentModel,
                                            });
                                        }}
                                        //
                                        //
                                        className="h-[35px] cursor-pointer bg-gray-800"
                                    >
                                        {`Build`}
                                        <HammerIcon color="white"></HammerIcon>
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </div>

                {llmStatus === "downloading" && (
                    <>
                        <div
                            className="flex h-full w-full shrink-0 items-center justify-center text-center text-sm"
                            style={{ width: `calc(100% - 350px)` }}
                        >
                            <div className="text-center">
                                <div className="my-4">{setupLLMProgress}</div>
                                <LoaderIcon className="mr-3 inline-block animate-spin"></LoaderIcon>
                            </div>
                        </div>
                    </>
                )}

                <div className="h-full w-[500px] shrink-0 bg-gray-200">
                    <CodePod></CodePod>
                </div>

                {files && (
                    <>
                        <div
                            className="flex h-full shrink-0"
                            style={{ width: `calc(100% - 350px)` }}
                        >
                            {/* file list */}
                            <div className="h-full w-[350px] overflow-x-hidden overflow-y-scroll border-r border-gray-300">
                                {/*  */}
                                <button
                                    className="px-3 py-2"
                                    onClick={() => {
                                        if (window.confirm("remove all?")) {
                                            WebLLMAppClient.resetApp();
                                        }
                                    }}
                                >
                                    Reset all
                                </button>
                                {files
                                    .slice()
                                    .sort(sortDate)
                                    .reverse()
                                    .map((it, i, files) => {
                                        //

                                        //
                                        return (
                                            <div
                                                key={it.path + i + "slides"}
                                                className={
                                                    (expandID === "" &&
                                                        i === 0) ||
                                                    expandID === it.path
                                                        ? `bg-green-200`
                                                        : `odd:bg-white even:bg-gray-100`
                                                }
                                            >
                                                <div
                                                    className="h-full w-full cursor-pointer px-3 py-2"
                                                    onClick={() => {
                                                        selectFile({
                                                            index: i,
                                                            total: files.length,
                                                            file: it,
                                                        });
                                                    }}
                                                >
                                                    {it.path}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* 250 */}
                            <div
                                className="h-full"
                                style={{ width: `calc(100% - 350px)` }}
                            >
                                {/*  */}
                                <div
                                    id="docs"
                                    className="relative h-full shrink-0 overflow-x-auto"
                                    style={{
                                        width: "100%",
                                    }}
                                >
                                    {files
                                        .slice()
                                        .sort(sortDate)
                                        .filter((r) => {
                                            return r?.path === expandID;
                                        })
                                        .map((file, i, n) => {
                                            let updatedAt = format(
                                                new Date(file.updatedAt),
                                                `yyyy-mm-dd h:m:s a`,
                                            );
                                            return (
                                                <div
                                                    key={file.path}
                                                    className="absolute top-0 left-0 flex w-[100%] shrink-0 items-center justify-center border-l border-gray-300 bg-gray-200 p-3 transition-transform duration-700 ease-in-out"
                                                    style={{
                                                        height: `calc(100%)`,
                                                        // display:
                                                        //     expandID ===
                                                        //         `${file.path}` ||
                                                        //     expandID === "" ||
                                                        //     !expandID
                                                        //         ? "flex"
                                                        //         : "none",
                                                    }}
                                                >
                                                    <div className="h-full w-full rounded-xl bg-white">
                                                        <div className="h-full w-full">
                                                            <div className="h-full w-full">
                                                                <div className="h-full w-full text-sm">
                                                                    <div className="flex justify-between rounded-t-2xl bg-gray-100 px-3 py-3">
                                                                        <span>
                                                                            {
                                                                                file.path
                                                                            }
                                                                            {
                                                                                " ✍🏻 "
                                                                            }
                                                                            {
                                                                                updatedAt
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    <MonacoEditor
                                                                        height="90vh"
                                                                        path={
                                                                            file.path
                                                                        }
                                                                        defaultLanguage={getLang(
                                                                            file.filename,
                                                                        )}
                                                                        value={
                                                                            file.content
                                                                        }
                                                                        onChange={(
                                                                            value,
                                                                        ) => {
                                                                            if (
                                                                                llmStatus ===
                                                                                "writing"
                                                                            ) {
                                                                            } else {
                                                                                file.content =
                                                                                    value;

                                                                                useGenAI.setState(
                                                                                    {
                                                                                        files: JSON.parse(
                                                                                            JSON.stringify(
                                                                                                files,
                                                                                            ),
                                                                                        ),
                                                                                    },
                                                                                );

                                                                                WebLLMAppClient.persistToDisk();
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                {/*  */}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/*  */}
        </>
    );
}
