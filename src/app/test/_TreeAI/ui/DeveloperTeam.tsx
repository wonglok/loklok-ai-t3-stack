"use client";

import { factortyReset, useAI } from "../state/useAI";

import {
    GlassWaterIcon,
    HammerIcon,
    LoaderIcon,
    PlugIcon,
    SquareIcon,
    StopCircleIcon,
    WalletCardsIcon,
} from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
// import { useEffect } from "react";

export function DeveloperTeam() {
    let engines = useAI((r) => r.engines);

    return (
        <>
            <div className="px-3">
                <div className="mb-3 rounded-lg border bg-white p-3 shadow-sm">
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (confirm("Factory Reset?")) {
                                factortyReset();
                            }
                        }}
                    >
                        Factory Reset
                    </Button>
                </div>
                {engines.map((engine) => {
                    let { name, displayName } = engine;
                    return (
                        <div
                            key={name + "onoff"}
                            className="mb-3 rounded-lg border bg-white p-3 shadow-sm"
                        >
                            <div className="space-y-0.5">
                                <div className="flex justify-between px-2">
                                    <div className="text-sm">{`${displayName}`}</div>
                                    <div className="flex items-center">
                                        <EnableSwitch
                                            name={name}
                                        ></EnableSwitch>
                                    </div>
                                </div>
                                <div>
                                    <AIMatcher name={name}></AIMatcher>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function AIMatcher({ name }: { name: string }) {
    let models = useAI((r) => r.models);
    let engines = useAI((r) => r.engines);
    let item = engines.find((r) => r.name === name);
    let atLeastOneWorkerRunning = useAI((r) => r.atLeastOneWorkerRunning);

    return (
        <>
            {item.enabled && (
                <Select
                    disabled={atLeastOneWorkerRunning}
                    value={item.modelName}
                    onValueChange={(v) => {
                        let model = models.find((r) => r.name === v);
                        item.modelName = v;
                        item.modelOriginalName = model.modelOriginalName;

                        useAI.setState({
                            engines: JSON.parse(JSON.stringify(engines)),
                        });
                    }}
                >
                    <SelectTrigger className="mt-2 w-[100%]">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent className="">
                        {models.map((model) => (
                            <SelectItem key={model.name} value={model.name}>
                                {model.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {item.bannerText && (
                <div
                    // onClick={() => {
                    //     //
                    //     let engine = item;

                    //     console.log(engine?.bannerData);
                    //     if (engine?.bannerData) {
                    //         if (engine.bannerData.type === "tab") {
                    //             if (engine.bannerData.topTab === "code") {
                    //                 useAI.setState({
                    //                     topTab: engine.bannerData.topTab,
                    //                     currentPath: engine.bannerData.filePath,
                    //                 });
                    //             }
                    //         }
                    //     }
                    //     //
                    // }}
                    className="mt-2 rounded-lg border p-2 text-center text-sm"
                >
                    {item.bannerText}
                </div>
            )}
        </>
    );
}

function EnableSwitch({ name }: { name: string }) {
    let engines = useAI((r) => r.engines);
    let item = engines.find((r) => r.name === name);
    let itemIDX = engines.findIndex((r) => r.name === name);
    let atLeastOneWorkerRunning = useAI((r) => r.atLeastOneWorkerRunning);

    return (
        <>
            {(item.status === "working" ||
                item.status === "reserved" ||
                item.status === "downloading") && (
                <div className="pr-3">
                    <LoaderIcon className="animate-spin"></LoaderIcon>
                </div>
            )}

            <Switch
                disabled={atLeastOneWorkerRunning}
                checked={item.enabled}
                onCheckedChange={(v) => {
                    item.enabled = v;

                    useAI.setState({
                        engines: JSON.parse(JSON.stringify(engines)),
                    });
                }}
            />
        </>
    );
}
