import { UIMessage } from "ai";
import { create } from "zustand";

export type MyFile = {
    path: string;
    content: string;
};

export type EngineSetting = {
    name: string;
    displayName: string;
    modelName: string;
    modelProvider: string;
    modelOriginalName: string;
    enabled: boolean;
    status: "empty" | "downloading" | "working" | "free";
    bannerData: any;
    bannerText: string;
};
export type MyModel = {
    provider: string;
    modelOriginalName: string;
    name: string;
};

const Models: MyModel[] = [
    {
        provider: "lmstudio",
        name: "openai/gpt-oss-20b",
        modelOriginalName: "openai/gpt-oss-20b",
    },
    {
        provider: "lmstudio",
        name: "openai/gpt-oss-20b:2",
        modelOriginalName: "openai/gpt-oss-20b",
    },
    {
        provider: "lmstudio",
        name: "openai/gpt-oss-20b:3",
        modelOriginalName: "openai/gpt-oss-20b",
    },
    {
        provider: "lmstudio",
        name: "openai/gpt-oss-20b:4",
        modelOriginalName: "openai/gpt-oss-20b",
    },
    {
        provider: "lmstudio",
        name: "openai/gpt-oss-20b:5",
        modelOriginalName: "openai/gpt-oss-20b",
    },
    {
        provider: "lmstudio",
        name: "openai/gpt-oss-20b:6",
        modelOriginalName: "openai/gpt-oss-20b",
    },
    {
        provider: "lmstudio",
        name: "openai/gpt-oss-20b:7",
        modelOriginalName: "openai/gpt-oss-20b",
    },
    {
        provider: "lmstudio",
        name: "openai/gpt-oss-120b",
        modelOriginalName: "openai/gpt-oss-20b",
    },
];

export const FSCache = {};

export const useTreeAI = create<{
    uiMessages: UIMessage[];
    userPrompt: string;
    files: MyFile[];
    appID: string;
    currentPath: string;
    atLeastOneWorkerRunning: boolean;
    engines: EngineSetting[];
    currentAIProvider: "lmstudio";
    models: MyModel[];
}>((set, get) => {
    return {
        //
        uiMessages: [
            {
                id: `_${Math.random()}`,
                role: "assistant",
                parts: [
                    {
                        type: "data-welcome",
                        data: ``,
                    },
                ],
            },
        ],
        userPrompt: "build a todo list",
        currentPath: "",
        appID: "myApp001",
        files: [],
        currentAIProvider: "lmstudio",
        models: Models,
        atLeastOneWorkerRunning: false,
        engines: [
            {
                name: "#01",
                displayName: "AI Developer 01",
                modelName: "openai/gpt-oss-20b",
                modelOriginalName: "openai/gpt-oss-20b",
                modelProvider: "lmstudio",
                status: "empty",
                enabled: true,
                bannerData: false,
                bannerText: "",
            },
            {
                name: "#02",
                displayName: "AI Developer 02",
                modelName: "openai/gpt-oss-20b:2",
                modelOriginalName: "openai/gpt-oss-20b",
                modelProvider: "lmstudio",
                status: "empty",
                enabled: process.env.NODE_ENV === "development",
                bannerData: false,
                bannerText: "",
            },
            {
                name: "#03",
                displayName: "AI Developer 03",
                modelName: "openai/gpt-oss-20b:3",
                modelOriginalName: "openai/gpt-oss-20b",
                modelProvider: "lmstudio",
                status: "empty",
                enabled: process.env.NODE_ENV === "development",
                bannerData: false,
                bannerText: "",
            },
            {
                name: "#04",
                displayName: "AI Developer 04",
                modelName: "openai/gpt-oss-20b:4",
                modelOriginalName: "openai/gpt-oss-20b",
                modelProvider: "lmstudio",
                status: "empty",
                enabled: process.env.NODE_ENV === "development",
                bannerData: false,
                bannerText: "",
            },
            {
                name: "#05",
                displayName: "AI Developer 05",
                modelName: "openai/gpt-oss-20b:5",
                modelOriginalName: "openai/gpt-oss-20b",
                modelProvider: "lmstudio",
                status: "empty",
                enabled: false,
                bannerData: false,
                bannerText: "",
            },
            {
                name: "#06",
                displayName: "AI Developer 06",
                modelName: "openai/gpt-oss-20b:6",
                modelOriginalName: "openai/gpt-oss-20b",
                modelProvider: "lmstudio",
                status: "empty",
                enabled: false,
                bannerData: false,
                bannerText: "",
            },
            {
                name: "#07",
                displayName: "AI Developer 07",
                modelName: "openai/gpt-oss-20b:7",
                modelOriginalName: "openai/gpt-oss-20b",
                modelProvider: "lmstudio",
                status: "empty",
                enabled: false,
                bannerData: false,
                bannerText: "",
            },
        ],
    };
});
