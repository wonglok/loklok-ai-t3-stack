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

import { useGenAI } from "../../useGenAI";

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
import {
    HammerIcon,
    LoaderIcon,
    SquareIcon,
    StopCircleIcon,
} from "lucide-react";
import { factoryResetThisApp } from "../llmCalls/common/factoryResetThisApp";

function AIMatcher({ name }: { name: string }) {
    let models = useGenAI((r) => r.models);
    let engines = useGenAI((r) => r.engines);
    let item = engines.find((r) => r.name === name);
    let lockInWorkers = useGenAI((r) => r.lockInWorkers);

    return (
        <>
            {item.enabled && (
                <Select
                    disabled={lockInWorkers}
                    value={item.currentModel}
                    onValueChange={(v) => {
                        item.currentModel = v;
                        useGenAI.setState({
                            engines: JSON.parse(JSON.stringify(engines)),
                        });
                    }}
                >
                    <SelectTrigger className="mt-2 w-[100%]">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent className="">
                        {models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                                {model.key}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
            {item.bannerText && (
                <div className="mt-2 rounded-lg border p-2">
                    {item.bannerText}
                </div>
            )}
        </>
    );
}

function EnableSwitch({ name }: { name: string }) {
    let engines = useGenAI((r) => r.engines);
    let item = engines.find((r) => r.name === name);
    let lockInWorkers = useGenAI((r) => r.lockInWorkers);

    return (
        <>
            {lockInWorkers && item.llmStatus === "writing" && (
                <div className="pr-3">
                    <LoaderIcon className="animate-spin"></LoaderIcon>
                </div>
            )}

            <Switch
                disabled={lockInWorkers}
                checked={item.enabled}
                onCheckedChange={(v) => {
                    item.enabled = v;
                    useGenAI.setState({
                        engines: JSON.parse(JSON.stringify(engines)),
                    });
                }}
            />
        </>
    );
}

export function Launcher() {
    let prompt = useGenAI((r) => r.prompt);
    let engines = useGenAI((r) => r.engines);
    let names = engines.map((r) => r.name);
    let lockInWorkers = useGenAI((r) => r.lockInWorkers);

    function onSubmit(ev) {
        ev.preventDefault();
    }

    return (
        <form
            onSubmit={onSubmit}
            className="h-full w-full space-y-4 overflow-y-auto"
        >
            <div className="flex flex-row items-center justify-between rounded-lg border shadow-sm">
                <textarea
                    className="h-[350px] w-full resize-none rounded-xl bg-white p-3 text-sm"
                    onChange={(e) => {
                        //

                        useGenAI.setState({
                            prompt: e.target.value,
                        });

                        //
                    }}
                    value={prompt}
                />
            </div>

            {!lockInWorkers && (
                <div className="flex justify-between text-right">
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (window.confirm("remove all?")) {
                                factoryResetThisApp();
                            }
                        }}
                    >
                        Delete all & Reboot?
                    </Button>
                    <Button
                        onClick={async () => {
                            await WebLLMAppClient.buildApp({
                                userPrompt: prompt,
                            });
                        }}
                        className="cursor-pointer"
                    >
                        Start Coding <HammerIcon></HammerIcon>
                    </Button>
                </div>
            )}

            {lockInWorkers && (
                <div className="flex justify-between text-right">
                    <Button variant="destructive" disabled>
                        Stop to Reset
                    </Button>
                    <Button
                        onClick={async () => {
                            await WebLLMAppClient.abortProcess();
                        }}
                        className="cursor-pointer"
                    >
                        Stop
                        <StopCircleIcon className="ml-1 animate-spin"></StopCircleIcon>
                    </Button>
                </div>
            )}

            {engines.map(({ name, displayName }) => {
                return (
                    <div
                        key={name + "onoff"}
                        className="rounded-lg border p-3 shadow-sm"
                    >
                        <div className="space-y-0.5">
                            <div className="flex justify-between px-2">
                                <div>{`${displayName}`}</div>
                                <div className="flex items-center">
                                    <EnableSwitch name={name}></EnableSwitch>
                                </div>
                            </div>
                            <div>
                                <AIMatcher name={name}></AIMatcher>
                            </div>
                        </div>
                    </div>
                );
            })}
        </form>
    );
}
