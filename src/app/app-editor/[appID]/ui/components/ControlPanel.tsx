import { useGenAI } from "../../useGenAI";
// import { Button } from "@/components/ui/button";
// import {
//     // DownloadCloudIcon,
//     // FileIcon,
//     // Loader2Icon,
//     // SendIcon,

//     HammerIcon,
//     LoaderIcon,
//     StopCircleIcon,
// } from "lucide-react";
// import { WebLLMAppClient } from "../util/WebLLMAppClient";

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
import {
    MonacoJsxSyntaxHighlight,
    getWorker,
} from "monaco-jsx-syntax-highlight";

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
import { useCallback, useEffect, useRef, useState } from "react";
import * as pathUtil from "path";
import { format } from "date-fns";
// import { CodePod } from "../util/CodePod";
// import { factoryResetThisApp } from "../llmCalls/common/factoryResetThisApp";
import { persistToDisk } from "../llmCalls/common/persistToDisk";
import { Launcher } from "./Launcher";
// import { CodePod } from "../util/CodePod";
// import { UseBoundStore } from "zustand";
// import { useEngineType } from "../llmCalls/common/makeEngine";

let getLang = (filename: string) => {
    if (pathUtil.extname(filename) === ".json") {
        return "json";
    } else if (pathUtil.extname(filename) === ".js") {
        return "javascript";
    } else if (pathUtil.extname(filename) === ".jsx") {
        return "javascript";
    } else if (pathUtil.extname(filename) === ".ts") {
        return "typescript";
    } else if (pathUtil.extname(filename) === ".tsx") {
        return "typescript";
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
    //
    let ref = useRef<any>(null);
    let lockInWorkers = useGenAI((r) => r.lockInWorkers);
    let files = useGenAI((r) => r.files);
    let sortedFiles = files?.slice().sort(sortDate).reverse();
    let track = sortedFiles[0]?.content === value;

    let [editor, setEditor] = useState<any>();

    useEffect(() => {
        if (editor) {
            editor.updateOptions({ wordWrap: false });
        }
    }, [editor]);

    useEffect(() => {
        if (lockInWorkers) {
            if (track) {
                if (editor) {
                    editor.revealLine(editor.getModel().getLineCount());
                    return () => {};
                }
            } else {
                // if (editor) {
                //     editor.revealLine(0);
                //     return () => {};
                // }
            }
        }
    }, [lockInWorkers, files]);

    const handleEditorDidMount = useCallback(
        (editor: any, monaco: any) => {
            setEditor(editor);

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                jsx: monaco.languages.typescript.JsxEmit.Preserve,
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                esModuleInterop: true,
                moduleResolution: "nodenext",
                baseUrl: "./src", // Or your project's base directory
                paths: {
                    "../types": ["./types/index.ts"], // Adjust to your actual path
                },
            });

            const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
                getWorker(),
                monaco,
            );

            // editor is the result of monaco.editor.create
            const { highlighter, dispose } =
                monacoJsxSyntaxHighlight.highlighterBuilder({
                    editor: editor,
                });

            try {
                // init highlight
                highlighter();
            } finally {
            }

            editor.onDidChangeModelContent(() => {
                // content change, highlight
                try {
                    highlighter();
                } finally {
                }
            });

            return dispose;
        },
        [path],
    );

    return (
        <div
            className="h-full w-full"
            onKeyDownCapture={(ev) => {
                if ((ev.ctrlKey || ev.metaKey) && ev.key === "Escape") {
                    ev.preventDefault();
                    ev.stopPropagation();

                    window.dispatchEvent(
                        new CustomEvent("save-editor", {
                            detail: {
                                path,
                                value,
                                defaultLanguage,
                            },
                        }),
                    );
                }
            }}
        >
            <Editor
                options={{
                    fontSize: 12,
                    lineHeight: 20.0,
                    automaticLayout: true,
                }}
                path={"file:///index.tsx"}
                // path={path}
                height={height}
                onMount={handleEditorDidMount}
                // defaultLanguage="typescript"
                language={
                    defaultLanguage
                    // llmStatus === "writing" && track && path.includes(".js")
                    //     ? "markdown"
                    //     : defaultLanguage
                }
                value={value}
                onChange={onChange}
            ></Editor>
        </div>
    );
}

let sortDate = (a: any, b: any) => {
    let dateA = new Date(a.createdAt).getTime();
    let dateB = new Date(b.createdAt).getTime();

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
    let engines = useGenAI((r) => r.engines);

    // let currentModel = useGlobalAI((r) => r.currentModel);
    // let prompt = useGlobalAI((r) => r.prompt);
    // let models = useGlobalAI((r) => r.models);
    // let setupLLMProgress = useGlobalAI((r) => r.setupLLMProgress);
    let expandID = useGenAI((r) => r.expandID);

    // let stopFunc = useGlobalAI((r) => r.stopFunc);
    let files = useGenAI((r) => r.files);

    let sortedFiles = files?.slice().sort(sortDate).reverse();
    // lockInWorkers

    useEffect(() => {
        if (sortedFiles[0]?.path && files.length === 1) {
            useGenAI.setState({ expandID: sortedFiles[0]?.path });
        }
    }, [sortedFiles.map((r) => r.path).join("")]);

    return (
        <>
            <div className="relative flex h-full w-full overflow-hidden text-sm">
                <div className="h-full w-[350px] shrink-0 bg-gray-300 p-3">
                    <div className="mb-3 flex h-full w-full resize-none flex-col justify-around rounded-xl bg-white p-3 text-sm">
                        <Launcher></Launcher>
                    </div>
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
                                {/* {files.filter((r) =>
                                    r.path.includes("entry/App"),
                                ).length > 0 && (
                                    <div className="aspect-video w-full">
                                    <CodePod></CodePod>
                                    </div>
                                )} */}

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
                                                    className="flex h-full w-full cursor-pointer justify-between px-3 py-2"
                                                    onClick={() => {
                                                        selectFile({
                                                            index: i,
                                                            total: files.length,
                                                            file: it,
                                                        });
                                                    }}
                                                >
                                                    <div>{it.path}</div>
                                                    <div>
                                                        {engines.find(
                                                            (r) =>
                                                                r.name ===
                                                                it.author,
                                                        )?.llmStatus ===
                                                            "writing" &&
                                                            `${it.author}`}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            <div
                                className="h-full"
                                style={{ width: `calc(100% - 350px)` }}
                            >
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
                                                        //
                                                        // display:
                                                        //     expandID ===
                                                        //         `${file.path}` ||
                                                        //     expandID === "" ||
                                                        //     !expandID
                                                        //         ? "flex"
                                                        //         : "none",
                                                        //
                                                    }}
                                                >
                                                    <div className="h-full w-full rounded-xl bg-white">
                                                        <div className="h-full w-full">
                                                            <div className="h-full w-full">
                                                                <div className="h-full w-full text-sm">
                                                                    <div className="flex justify-between rounded-t-2xl bg-gray-100 px-3 py-3">
                                                                        <span>
                                                                            {
                                                                                "⭐️ "
                                                                            }
                                                                            {
                                                                                file.path
                                                                            }
                                                                        </span>
                                                                        <span>
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
                                                                            //

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

                                                                            persistToDisk();
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
