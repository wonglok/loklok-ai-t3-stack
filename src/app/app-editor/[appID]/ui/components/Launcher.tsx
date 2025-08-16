"use client";

import {
    PromptInputModelSelect,
    PromptInputModelSelectContent,
    PromptInputModelSelectItem,
    PromptInputModelSelectTrigger,
    PromptInputModelSelectValue,
    //
    // PromptInputSubmit,
    // PromptInputTextarea,
    // PromptInputToolbar,
    // PromptInputTools,
    // PromptInput,
    // PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import { useEffect } from "react";
import { makeEngine } from "../llmCalls/common/makeEngine";
import { useGlobalAI } from "../../useGlobalAI";

import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { WebLLMAppClient } from "../util/WebLLMAppClient";

function AIMatcher({ name }: { name: string }) {
    let engines = useGlobalAI((r) => r.engines);
    let useEngine = engines.find((r) => r.name === name)?.useEngine;
    let currentModel = useEngine((r) => r.currentModel);
    let models = useEngine((r) => r.models);

    return (
        <>
            <Select
                value={currentModel}
                onValueChange={(v) => {
                    useEngine.setState({
                        currentModel: v,
                    });
                }}
            >
                <SelectTrigger className="mt-2 w-[100%]">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                    {models.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                            {model.key}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    );
}

function EnableSwitch({ name }: { name: string }) {
    let engines = useGlobalAI((r) => r.engines);
    let useEngine = engines.find((r) => r.name === name)?.useEngine;
    let enabled = useEngine((r) => r.enabled);
    return (
        <>
            <Switch
                checked={enabled}
                onCheckedChange={(v) => {
                    useEngine.setState({
                        enabled: v,
                    });
                }}
            />
        </>
    );
}

export function Launcher() {
    let prompt = useGlobalAI((r) => r.prompt);
    let engines = useGlobalAI((r) => r.engines);
    let names = engines.map((r) => r.name);

    function onSubmit(ev) {
        ev.preventDefault();

        let data = {};

        WebLLMAppClient.buildApp({
            userPrompt: prompt,
        });

        toast("You submitted the following values", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">
                        {JSON.stringify(data, null, 2)}
                    </code>
                </pre>
            ),
        });
    }

    return (
        <form onSubmit={onSubmit} className="h-full w-full space-y-4">
            {names.map((name) => {
                return (
                    <div
                        key={name + "onoff"}
                        className="rounded-lg border p-3 shadow-sm"
                    >
                        <div className="space-y-0.5">
                            <div className="flex justify-between px-2">
                                <div>{`AI Developer ${name}`}</div>
                                <EnableSwitch name={name}></EnableSwitch>
                            </div>
                            <div>
                                <AIMatcher name={name}></AIMatcher>
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="flex flex-row items-center justify-between rounded-lg border shadow-sm">
                <textarea
                    className="h-[220px] w-full resize-none rounded-xl bg-white p-3 text-sm"
                    onChange={(e) => {
                        //

                        useGlobalAI.setState({
                            prompt: e.target.value,
                        });

                        //
                    }}
                    value={prompt}
                />
            </div>

            <Button type="submit">Build</Button>
        </form>
    );
}
