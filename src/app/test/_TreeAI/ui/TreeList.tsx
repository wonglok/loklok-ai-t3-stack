import * as React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeAI } from "../state/useTreeAI";

export function TreeList() {
    let files = useTreeAI((r) => r.files);

    return (
        <SimpleTreeView expandedItems={["/docs"]} className="h-full w-full">
            {/*  */}
            <TreeItem itemId="/docs" label="App Docs">
                {files
                    .filter((r) => r?.path?.startsWith("/docs"))
                    .map((r) => {
                        return (
                            <TreeItem
                                key={r.path}
                                itemId={r.path}
                                label={r.path}
                                onClick={() => {
                                    useTreeAI.setState({
                                        currentPath: r.path,
                                    });
                                }}
                            />
                        );
                    })}
            </TreeItem>

            {files.filter((r) => r.path.startsWith("/react"))?.length > 0 && (
                <TreeItem itemId="react" label="React Components">
                    {files
                        .filter((r) => r.path.startsWith("/react"))
                        .map((r) => {
                            return (
                                <TreeItem
                                    key={r.path}
                                    itemId={r.path}
                                    label={r.path}
                                />
                            );
                        })}
                </TreeItem>
            )}
        </SimpleTreeView>
    );
}
