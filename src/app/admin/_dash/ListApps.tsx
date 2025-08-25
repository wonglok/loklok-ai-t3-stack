// import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import nprogress from "nprogress";
export function ListApps() {
    let router = useRouter();
    const apps = api.inst.listMy.useMutation();
    const removeApp = api.inst.deleteOne.useMutation();
    const updateApp = api.inst.updateOne.useMutation();

    useEffect(() => {
        apps.mutateAsync({});
    }, []);

    let refTT = useRef<any>(0);

    useEffect(() => {
        let hh = () => {
            //
            //
            apps.mutateAsync({});
            //
            //
        };
        window.addEventListener("reload-apps-list", hh);
        return () => {
            window.removeEventListener("reload-apps-list", hh);
        };
    }, []);
    //
    return (
        <>
            <div className="px-3">
                <ScrollArea className="h-72 w-full rounded-md border bg-white">
                    <div className="p-3">
                        <h4 className="mx-2 mb-3 text-lg leading-none font-medium">
                            Apps
                        </h4>
                        {apps.data?.map((it) => {
                            return (
                                <div key={it._id} className="my-1 p-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="w-1/2">
                                            <Input
                                                className="w-full"
                                                defaultValue={it.name}
                                                onChange={(ev) => {
                                                    nprogress.start();

                                                    clearTimeout(refTT.current);
                                                    refTT.current = setTimeout(
                                                        () => {
                                                            updateApp
                                                                .mutateAsync({
                                                                    _id: `${it._id}`,
                                                                    name:
                                                                        ev.target.value.trim() ||
                                                                        "",
                                                                })
                                                                .then(() => {
                                                                    nprogress.done();
                                                                });
                                                        },
                                                        500,
                                                    );
                                                }}
                                            ></Input>
                                        </div>
                                        <div>
                                            <Button
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            "remove?",
                                                        )
                                                    ) {
                                                        removeApp.mutate({
                                                            _id: `${it._id}`,
                                                        });
                                                        apps.mutate({});
                                                    }
                                                }}
                                                className="mr-2"
                                                variant="destructive"
                                            >
                                                Delete
                                            </Button>
                                            <Button
                                                className="mr-2"
                                                onClick={() => {
                                                    ///
                                                    window.open(
                                                        `/apps/${it._id}/${"run"}`,
                                                    );
                                                }}
                                            >
                                                Preview
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    //
                                                    router.push(
                                                        `/apps/${it._id}/${"edit"}`,
                                                    );
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mb-3"></div>
                                    <Separator className="mb-3" />
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* <pre>{JSON.stringify(apps.data, null, "\t")}</pre> */}
        </>
    );
}
