"use client";

import { create } from "zustand";

export const useAI = create((set, get) => {
    let models = [
        {
            key: "Qwen Coder 1.5B (~750MB)",
            value: `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC`,
        },
        {
            key: "Qwen Coder 3B (~1.5GB)",
            value: `Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC`,
        },
        {
            key: "Qwen Coder 7B (~4GB)",
            value: `Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC`,
        },
    ];

    return {
        models: models,
    };
});
