import { create } from "zustand";
import { functionCallingModelIds } from "@mlc-ai/web-llm";
import * as webllm from "@mlc-ai/web-llm";
import { object, set } from "zod";
import md5 from "md5";

console.log(functionCallingModelIds);

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

export const useGenAI = create<{
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

    onCancelSigature: () => void;

    models: { key: string; value: string }[];

    stopFunc: () => void;
    refreshSlot: (v: any) => void;
}>((set, get) => {
    let models = [
        {
            key: "Llama-3.1-8B-Instruct ~ RAM 5GB",
            value: `Llama-3.1-8B-Instruct-q4f16_1-MLC`,
        },
        {
            key: "Hermes-2-Pro-Llama-3-8B ~ RAM 5GB",
            value: `Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC`,
        },
        // {
        //     key: "Qwen Coder 1.5B ~ RAM 750B",
        //     value: `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC`,
        // },
        {
            key: "Qwen Coder 3B ~ RAM 1.5B",
            value: `Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC`,
        },
        {
            key: "Qwen Coder 7B ~ RAM 4GB",
            value: `Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC`,
        },
        // {
        //     key: "Qwen 3 8B (4GB)",
        //     value: "Qwen3-8B-q4f16_1-MLC",
        // },
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

    let enable4th = false;
    let enable3rd = false;
    let enable2nd = false;
    if (typeof window !== "undefined") {
        let memory =
            (window?.performance as any)?.memory?.jsHeapSizeLimit /
            1024 /
            1024 /
            1024;

        if (memory >= 3.0) {
            enable2nd = true;
        }
        if (memory >= 3.5) {
            enable3rd = true;
        }
        if (memory >= 3.85) {
            enable4th = true;
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
                name: "#01",
                displayName: "AI Developer 01",

                currentModel: models[0].value,
                llmStatus: "empty",
                bannerText: "",
                bannerData: null,
            },
            {
                lockedBy: "",
                enabled: enable2nd,
                name: "#02",
                displayName: "AI Developer 02",

                currentModel: models[0].value,
                llmStatus: "empty",
                bannerText: "",
                bannerData: null,
            },
            {
                lockedBy: "",
                enabled: enable3rd,
                name: "#03",
                displayName: "AI Developer 03",

                currentModel: models[0].value,
                llmStatus: "empty",
                bannerText: "",
                bannerData: null,
            },
            {
                lockedBy: "",
                enabled: false,
                name: "#04",
                displayName: "AI Developer 04",

                currentModel: models[0].value,
                llmStatus: "empty",
                bannerText: "",
                bannerData: null,
            },
            {
                lockedBy: "",
                enabled: false,
                name: "#05",
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
        prompt: `I want to build an e-class software for a teacher and their students.

Here are the user types / role:
1. System Admin (can access all features)
2. Teacher (can access teacher features and Student features)
3. Student (can only access student features)

System Admin can create Teacher Login Accounts and Student Login Accounts.

Teacher can create, update, delete, and metaverse.

Metaverse has
- Avatars of Teachers walking around
- Avatars of Students walking around
- NPC Avatars standing at spots
- Environment Lighting
- Venue 3D model like School / Canteen

Teacher can create NPC Avatars
Teacher can create Page.

1. Each Page has a Metaverse
2. Each Metaverse has a few NPC Avatars
3. Each NPC Avatar can have multiple functionalities in the following:
    1. Generic NPC Avatars have different functionality. 
        - Quiz Function
        - Video Watching Function
        - Portal Function
4. Create Student Account Login (register for students in batch)

Teacher can review analytics and report
1. Student Learning Progress
2. Quiz Scores
3. Traffic Count
5. VR Practice data
6. Page view count


Student can
1. Register to Metaverse 
2. Login to Metaverse
3. Interact with NPC
4. Track their learning progress
    1. View what quiz are finished and what quiz haven't started
    2. View which video watched or not
    3. View VR Practice Result

`.trim(),
        loadingSpec: false,
        welcome: true,
        spec: "",
        setupLLMProgress: "",
        brainworks: false,
    };
});
