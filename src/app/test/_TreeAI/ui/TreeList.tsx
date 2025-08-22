import * as React from "react";
// import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useAI } from "../state/useAI";
import { basename } from "path";
// import { DeveloperTeam } from "./DeveloperTeam";

export function TreeList() {
    let files = useAI((r) => r.files);
    files = files || [];
    let currentPath = useAI((r) => r.currentPath);

    return (
        <SimpleTreeView
            defaultExpandedItems={["/docs", "/components"]}
            className="h-full w-full"
        >
            {/*  */}
            {/* <TreeItem
                key={"team-btn"}
                itemId={"team-btn"}
                label={"👫 AI Team"}
                onClick={() => {
                    useAI.setState({ topTab: "team" });
                }}
            ></TreeItem> */}

            {/* <TreeItem
                key={"chat-btn"}
                itemId={"chat-btn"}
                label={"🤖 AI Chat Channel"}
                onClick={() => {
                    useAI.setState({ topTab: "chat" });
                }}
            ></TreeItem> */}

            <TreeItem
                key={"view-btn"}
                itemId={"view-btn"}
                label={<>{"📲 Preview"}</>}
                onClick={() => {
                    useAI.setState({ topTab: "web" });
                }}
            ></TreeItem>

            {/* <TreeItem
                key={"code-btn"}
                itemId={"code-btn"}
                label={<>{"🧑🏻‍💻 Code"}</>}
                onClick={() => {
                    useAI.setState({ topTab: "code" });
                }}
            ></TreeItem> */}

            {/*  */}
            <TreeItem
                itemId="/docs"
                label={`🍱 ${"App Docs"}`}
                onClick={() => {
                    //
                    useAI.setState({
                        topTab: "code",
                    });
                    //
                }}
            >
                {files
                    .filter((r) => r?.path?.startsWith("/docs"))
                    .map((r) => {
                        return (
                            <TreeItem
                                key={r.path}
                                itemId={r.path}
                                label={`${r.path} ${r.path === currentPath ? "✍🏻✨" : ""}`}
                                onClick={() => {
                                    useAI.setState({
                                        topTab: "code",
                                        currentPath: r.path,
                                    });
                                }}
                            />
                        );
                    })}
            </TreeItem>

            <TreeItem
                itemId="/components"
                label={
                    <>
                        📂
                        {` React Components`}
                    </>
                }
                onClick={() => {
                    //
                    useAI.setState({
                        topTab: "code",
                    });
                    //
                }}
            >
                {files
                    .filter((r) => r?.path?.startsWith("/components"))
                    .map((r) => {
                        return (
                            <TreeItem
                                key={r.path}
                                itemId={r.path}
                                label={`${r.path}`}
                                onClick={() => {
                                    useAI.setState({
                                        topTab: "code",
                                        currentPath: r.path,
                                    });
                                }}
                            />
                        );
                    })}
            </TreeItem>
        </SimpleTreeView>
    );
}
