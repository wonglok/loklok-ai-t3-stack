import { useTreeAI } from "../state/useTreeAI";

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

export function DeveloperTeam() {
    let engines = useTreeAI((r) => r.engines);
    return (
        <>
            <div className="p-3">
                {engines.map(({ name, displayName }) => {
                    return (
                        <div
                            key={name + "onoff"}
                            className="mb-5 rounded-lg border p-3 shadow-sm"
                        >
                            <div className="space-y-0.5">
                                <div className="flex justify-between px-2">
                                    <div>{`${displayName}`}</div>
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
    let models = useTreeAI((r) => r.models);
    let engines = useTreeAI((r) => r.engines);
    let item = engines.find((r) => r.name === name);
    let atLeastOneWorkerRunning = useTreeAI((r) => r.atLeastOneWorkerRunning);

    return (
        <>
            {item.enabled && (
                <Select
                    disabled={atLeastOneWorkerRunning}
                    value={item.modelName}
                    onValueChange={(v) => {
                        item.modelName = v;
                        useTreeAI.setState({
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
                    onClick={() => {
                        if (item?.bannerData && item?.bannerData?.path) {
                            useTreeAI.setState({
                                currentPath: item?.bannerData?.path,
                            });
                        }
                    }}
                    className="mt-2 rounded-lg border p-2"
                >
                    {item.bannerText}
                </div>
            )}
        </>
    );
}

function EnableSwitch({ name }: { name: string }) {
    let engines = useTreeAI((r) => r.engines);
    let item = engines.find((r) => r.name === name);
    let atLeastOneWorkerRunning = useTreeAI((r) => r.atLeastOneWorkerRunning);

    return (
        <>
            {atLeastOneWorkerRunning && item.status === "working" && (
                <div className="pr-3">
                    <LoaderIcon className="animate-spin"></LoaderIcon>
                </div>
            )}

            <Switch
                disabled={atLeastOneWorkerRunning}
                checked={item.enabled}
                onCheckedChange={(v) => {
                    item.enabled = v;
                    useTreeAI.setState({
                        engines: JSON.parse(JSON.stringify(engines)),
                    });
                }}
            />
        </>
    );
}
