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
    bannerData?: any;
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

    let enable3rd = false;
    let enable2nd = false;
    if (typeof window !== "undefined") {
        let memory =
            (window?.performance as any)?.memory?.jsHeapSizeLimit /
            1024 /
            1024 /
            1024;

        if (memory >= 2.5) {
            enable2nd = true;
        }
        if (memory >= 3.5) {
            enable3rd = true;
        }
    }

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
                bannerText: "",
                bannerData: null,
            },
            {
                lockedBy: "",
                enabled: enable2nd,
                name: "_02",
                displayName: "AI Developer 02",

                currentModel: models[0].value,
                llmStatus: "empty",
                bannerText: "",
                bannerData: null,
            },
            {
                lockedBy: "",
                enabled: enable3rd,
                name: "_03",
                displayName: "AI Developer 03",

                currentModel: models[0].value,
                llmStatus: "empty",
                bannerText: "",
                bannerData: null,
            },
            {
                lockedBy: "",
                enabled: false,
                name: "_04",
                displayName: "AI Developer 04",

                currentModel: models[0].value,
                llmStatus: "empty",
                bannerText: "",
                bannerData: null,
            },
            {
                lockedBy: "",
                enabled: false,
                name: "_05",
                displayName: "AI Developer 05",

                currentModel: models[0].value,
                llmStatus: "empty",
                bannerText: "",
                bannerData: null,
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
        prompt: `I want to build an eClass School multipurpose Metaverse using ThreeJS and React Three Fiber Framework and nextJS and React JS Library. 

I want to have a system portal for me to login.

Teacher portal can 
1. generate student login account.
2. Upload 3d room
3. Create avatar and some embed code to it or iframe URL to it
4. Upload Videos 
5. Upload Quiz and Questions
6. Add Video to Avatar
7. Add Quiz to Avatar
8. Dashboard 

Student can login to the metaverse and have fun.
1. Do Quiz
2. Watch Video in NPC Avatar
3. View Learning Progress of Video Watching and Quiz Doing

System portal can generate teacher login account and student login account.
and have every feature above.

`.trim(),
        loadingSpec: false,
        welcome: true,
        spec: "",
        setupLLMProgress: "",
        brainworks: false,
    };
});
