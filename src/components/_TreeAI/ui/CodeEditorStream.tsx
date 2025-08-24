import { useCallback, useEffect, useRef, useState } from "react";
import { useAI } from "../state/useAI";
import { Editor } from "@monaco-editor/react";
import {
    getWorker,
    MonacoJsxSyntaxHighlight,
} from "monaco-jsx-syntax-highlight";

export function CodeEditorStream({
    width = "500px",
    height = "250px",
    text,
    language = "markdown",
}) {
    // let ref = useRef<any>(null);

    let atLeastOneWorkerRunning = useAI((r) => r.atLeastOneWorkerRunning);

    let [editor, setEditor] = useState<any>();

    useEffect(() => {
        if (editor) {
            editor.updateOptions({ wordWrap: false });
            editor.revealLine(0);
        }
    }, [editor]);

    useEffect(() => {
        if (atLeastOneWorkerRunning) {
            if (editor) {
                editor.revealLine(editor.getModel().getLineCount());
                return () => {};
            }
        } else {
            //
        }
    }, [atLeastOneWorkerRunning, text]);

    const refClean = useRef([]);

    const handleEditorDidMount = useCallback(
        (editor: any, monaco: any) => {
            setEditor(editor);

            if (atLeastOneWorkerRunning) {
                return () => {};
            }

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                jsx: monaco.languages.typescript.JsxEmit.Preserve,
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                esModuleInterop: true,
                // moduleResolution: "nodenext",
                baseUrl: "./", // Or your project's base directory
                paths: {
                    // "../types": ["./types/index.ts"], // Adjust to your actual path
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
                    try {
                        dispose();
                    } catch (e) {}
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
        [atLeastOneWorkerRunning],
    );

    return (
        <Editor
            options={{
                fontSize: 9,
                lineHeight: 12,
            }}
            height={height}
            width={width}
            onMount={handleEditorDidMount}
            language={atLeastOneWorkerRunning ? "text" : language}
            value={text}
        ></Editor>
    );
}
