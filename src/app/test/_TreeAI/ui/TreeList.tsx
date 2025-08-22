import * as React from "react";
// import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useAI } from "../state/useAI";
import { basename } from "path";
import { LokLokSDK } from "../web/LokLokSDK";
import { readFileContent } from "../io/readFileContent";
// import { DeveloperTeam } from "./DeveloperTeam";

export function TreeList() {
    let files = useAI((r) => r.files);
    files = files || [];

    console.log(files);

    // let currentPath = useAI((r) => r.currentPath);

    return (
        <SimpleTreeView
            defaultExpandedItems={["/docs", "/components"]}
            className="h-full w-full"
        >
            {/*  */}
            <TreeItem
                key={"Deploy-btn"}
                itemId={"Deploy-btn"}
                label={"💻 Deploy"}
                onClick={async () => {
                    let sdk = new LokLokSDK({
                        appID: useAI.getState().appID,
                    });

                    await sdk.setupPlatform({
                        procedure: "reset",
                        input: {
                            empty: 123,
                        },
                    });

                    for (let file of files) {
                        await sdk.setupPlatform({
                            procedure: "setKV",
                            input: {
                                key: file.path,
                                value: file.content,
                            },
                        });
                    }
                }}
            ></TreeItem>

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
            {/* <TreeItem
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

            */}

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
                                label={
                                    <div className="h-full w-full overflow-x-auto">
                                        {r.path}
                                    </div>
                                }
                                onClick={() => {
                                    useAI.setState({
                                        topTab: "code",
                                        currentPath: r.path,
                                    });
                                }}
                            />
                        );
                    })}

                {/*  */}
            </TreeItem>

            <TreeItem
                itemId="/models"
                label={
                    <>
                        📂
                        {` Mongoose models`}
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
                    .filter((r) => r?.path?.startsWith("/models"))
                    .map((r) => {
                        return (
                            <TreeItem
                                key={r.path}
                                itemId={r.path}
                                label={
                                    <div className="h-full w-full overflow-x-auto">
                                        {r.path}
                                    </div>
                                }
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
                itemId="/store"
                label={
                    <>
                        📂
                        {` Zustand store`}
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
                    .filter((r) => r?.path?.startsWith("/store"))
                    .map((r) => {
                        return (
                            <TreeItem
                                key={r.path}
                                itemId={r.path}
                                label={
                                    <div className="h-full w-full overflow-x-auto">
                                        {r.path}
                                    </div>
                                }
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
                itemId="/trpc"
                label={
                    <>
                        📂
                        {` TRPC models`}
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
                    .filter((r) => r?.path?.startsWith("/trpc"))
                    .map((r) => {
                        return (
                            <TreeItem
                                key={r.path}
                                itemId={r.path}
                                label={
                                    <div className="h-full w-full overflow-x-auto">
                                        {r.path}
                                    </div>
                                }
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

            {/* {files.map((r) => {
                return (
                    <TreeItem
                        key={r.path + "any"}
                        itemId={r.path + "itemid"}
                        label={`${r.path}`}
                        onClick={() => {
                            useAI.setState({
                                topTab: "code",
                                currentPath: r.path,
                            });
                        }}
                    />
                );
            })} */}
        </SimpleTreeView>
    );
}
