import { create } from "zustand";
import type * as webllm from "@mlc-ai/web-llm";
import { object, set } from "zod";
import md5 from "md5";

export type MyFile = {
    filename: string;
    path: string;
    content: string;
    updatedAt: string;
    createdAt: string;
    inputSignature: string;
    author: string;
};

export type EngineData = {
    displayName: string;
    lockedBy: string;

    enabled: boolean;
    name: string;
    currentModel: string;

    //
    llmStatus: "empty" | "downloading" | "idle" | "writing";
    // engine: webllm.MLCEngineInterface;
    bannerText: string;
};

export const useGlobalAI = create<{
    lockInWorkers: boolean;
    files: MyFile[];
    expandID: string;

    // llmStatus: "empty" | "downloading" | "idle" | "writing";

    // currentModel: string;

    appID: string;
    prompt: string;
    loadingSpec: boolean;
    welcome: boolean;
    spec: string;
    setupLLMProgress: string;
    loading: false;
    engines: EngineData[];

    brainworks: boolean;
    //
    onCancelSigature: () => void;
    //

    models: { key: string; value: string }[];

    stopFunc: () => void;
    refreshSlot: (v: any) => void;
}>((set, get) => {
    let models = [
        // {
        //     key: "Qwen Coder 1.5B (~750MB)",
        //     value: `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC`,
        // },
        {
            key: "Qwen Coder 3B (~1.5GB)",
            value: `Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC`,
        },
        {
            key: "Qwen Coder 7B (~4GB)",
            value: `Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC`,
        },
    ];

    let refreshSlot = (slot) => {
        set({
            engines: JSON.parse(
                JSON.stringify(
                    get().engines.map((r: any) => {
                        if (r.name === slot.name) {
                            return slot;
                        }
                        return r;
                    }),
                ),
            ),
        });
    };

    return {
        lockInWorkers: false,
        refreshSlot: refreshSlot,
        loading: false,

        //
        engines: [
            {
                lockedBy: "",
                enabled: true,
                name: "_01",
                displayName: "AI Developer 01",

                currentModel: models[0].value,
                llmStatus: "empty",
                // engine: null,
                bannerText: "",
            },
            {
                lockedBy: "",
                enabled: true,
                name: "_02",
                displayName: "AI Developer 02",

                currentModel: models[0].value,
                llmStatus: "empty",
                // engine: null,
                bannerText: "",
            },
            {
                lockedBy: "",
                enabled: false,
                name: "_03",
                displayName: "AI Developer 03",

                currentModel: models[0].value,
                llmStatus: "empty",
                // engine: null,
                bannerText: "",
            },
            {
                lockedBy: "",
                enabled: false,
                name: "_04",
                displayName: "AI Developer 04",

                currentModel: models[0].value,
                llmStatus: "empty",
                // engine: null,
                bannerText: "",
            },
            {
                lockedBy: "",
                enabled: false,
                name: "_05",
                displayName: "AI Developer 05",

                currentModel: models[0].value,
                llmStatus: "empty",
                // engine: null,
                bannerText: "",
            },
        ],

        llmStatus: "idle",

        files: [],
        expandID: "",

        onCancelSigature: () => {},

        stopFunc: () => {},
        models: models,

        // currentModel: models[0].value,
        appID: "",
        prompt: `I want to build a bible testimony app powered by ai embeddings and RAG Agents.

## PlatformAdmin:
PlatformAdmin can login to Platform Portal. 
PlatformAdmin can create Pastor's Login Accounts and help Pastors reset password.

## Pastor:
Pastors can login to Pastor Portal.

Pastor Portal can do a few things:
1. upload testimony text and youtube video link 
2. edit testimony and set it to be hidden or visible.
3. generate embeddings data for the testimony.
4. approve and publish the testimony to their pastor account.

## Internet users:
Internet Users can visit public web app at home page of the website. 
In Public WebApp, they can view testimony preview, video and text.
In Public WebApp, they can search testimony powered by ai.

Internet Users can login to their user profile.
In User Profile, they can write testimony and request pastor to approve for publishing to public.
`.trim(),
        loadingSpec: false,
        welcome: true,
        spec: "",
        setupLLMProgress: "",
        brainworks: false,
    };
});
