import * as React from "react";
// import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeAI } from "../state/useTreeAI";
// import { DeveloperTeam } from "./DeveloperTeam";

export function TreeList() {
    let files = useTreeAI((r) => r.files);
    files = files || [];

    return (
        <SimpleTreeView className="h-full w-full">
            {/*  */}
            {/* <TreeItem
                key={"team-btn"}
                itemId={"team-btn"}
                label={"👫 AI Team"}
                onClick={() => {
                    useTreeAI.setState({ topTab: "team" });
                }}
            ></TreeItem> */}

            {/* <TreeItem
                key={"chat-btn"}
                itemId={"chat-btn"}
                label={"🤖 AI Chat Channel"}
                onClick={() => {
                    useTreeAI.setState({ topTab: "chat" });
                }}
            ></TreeItem> */}

            <TreeItem
                key={"view-btn"}
                itemId={"view-btn"}
                label={<>{"📲 Preview"}</>}
                onClick={() => {
                    useTreeAI.setState({ topTab: "web" });
                }}
            ></TreeItem>

            {/* <TreeItem
                key={"code-btn"}
                itemId={"code-btn"}
                label={<>{"🧑🏻‍💻 Code"}</>}
                onClick={() => {
                    useTreeAI.setState({ topTab: "code" });
                }}
            ></TreeItem> */}

            {/*  */}
            <TreeItem
                itemId="/docs"
                label={`🍱 ${"App Docs"}`}
                onClick={() => {
                    //
                    useTreeAI.setState({
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
                                label={`${r.path}`}
                                onClick={() => {
                                    useTreeAI.setState({
                                        topTab: "code",
                                        currentPath: r.path,
                                    });
                                }}
                            />
                        );
                    })}
            </TreeItem>

            <TreeItem
                itemId="/react"
                label={
                    <>
                        📂
                        {` React Component`}
                    </>
                }
                onClick={() => {
                    //
                    useTreeAI.setState({
                        topTab: "code",
                    });
                    //
                }}
            >
                {files
                    .filter((r) => r?.path?.startsWith("/react"))
                    .map((r) => {
                        return (
                            <TreeItem
                                key={r.path}
                                itemId={r.path}
                                label={`${r.path}`}
                                onClick={() => {
                                    useTreeAI.setState({
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
