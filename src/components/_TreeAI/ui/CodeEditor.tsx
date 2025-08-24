import { useCallback, useEffect, useRef, useState } from "react";
import { useAI } from "../state/useAI";
import { sortDate } from "./func/sortDate";
import { Editor } from "@monaco-editor/react";
import {
    getWorker,
    MonacoJsxSyntaxHighlight,
} from "monaco-jsx-syntax-highlight";
import { getLang } from "./func/getLang";

export function CodeEditor() {
    // let ref = useRef<any>(null);

    let atLeastOneWorkerRunning = useAI((r) => r.atLeastOneWorkerRunning);
    let files = useAI((r) => r.files);
    let sortedFiles = files?.slice().sort(sortDate).reverse();
    let currentPath = useAI((r) => r.currentPath);
    let file = files.find((r) => r.path === currentPath);
    let track = sortedFiles[0]?.content === file?.content;

    let [editor, setEditor] = useState<any>();

    useEffect(() => {
        if (editor) {
            editor.updateOptions({ wordWrap: false });
        }
    }, [editor]);

    useEffect(() => {
        if (atLeastOneWorkerRunning && currentPath === sortedFiles[0]?.path) {
            if (track) {
                if (editor) {
                    // editor.revealLine(editor.getModel().getLineCount());
                    return () => {};
                }
            } else {
                //
                // if (editor) {
                //     editor.revealLine(0);
                //     return () => {};
                // }
                //
            }
        }
    }, [atLeastOneWorkerRunning, files]);

    const refClean = useRef([]);

    const handleEditorDidMount = useCallback(
        (editor: any, monaco: any) => {
            setEditor(editor);

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                jsx: monaco.languages.typescript.JsxEmit.Preserve,
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                esModuleInterop: true,
                // moduleResolution: "nodenext",
                baseUrl: "./", // Or your project's base directory
                paths: {
                    // "../types": ["./types/index.js"], // Adjust to your actual path
                },
            });

            try {
                if (refClean.current) {
                    refClean.current.forEach((r) => r());
                    refClean.current = [];
                }

                const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
                    getWorker(),
                    monaco,
                );

                // editor is the result of monaco.editor.create
                const { highlighter, dispose } =
                    monacoJsxSyntaxHighlight.highlighterBuilder({
                        editor: editor,
                    });

                refClean.current.push(() => {
                    dispose();
                });

                setTimeout(() => {
                    try {
                        highlighter();
                    } catch (e) {}
                }, 100);

                editor.onDidChangeModelContent(() => {
                    try {
                        highlighter();
                    } catch (e) {}
                });
            } catch (e) {}

            return () => {};
        },
        [file?.path, files.map((r) => r.path).join("")],
    );

    return (
        <>
            {file && file.content && (
                <div
                    className="h-full w-full shrink-0"
                    onKeyDownCapture={(ev) => {
                        if ((ev.ctrlKey || ev.metaKey) && ev.key === "Escape") {
                            ev.preventDefault();
                            ev.stopPropagation();

                            window.dispatchEvent(
                                new CustomEvent("save-editor", {
                                    detail: file,
                                }),
                            );
                        }
                    }}
                >
                    {
                        <Editor
                            className="overflow-hidden rounded-lg"
                            options={{
                                fontSize: 12,
                                lineHeight: 25.0,
                            }}
                            path={currentPath}
                            // path={path}
                            width={"100%"}
                            height={"100%"}
                            onMount={handleEditorDidMount}
                            // defaultLanguage="javascript"
                            language={
                                getLang(file.path)
                                // llmStatus === "writing" && track && path.includes(".js")
                                //     ? "markdown"
                                //     : defaultLanguage
                            }
                            value={file.content}
                            onChange={(v) => {
                                if (file) {
                                    file.content = `${v}`;
                                }
                            }}
                        ></Editor>
                    }
                </div>
            )}
        </>
    );
}
