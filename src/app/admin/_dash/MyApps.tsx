// import { trpc } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export function MyApps() {
    const apps = api.inst.listMy.useMutation();
    const create = api.inst.create.useMutation();

    const [name, setName] = useState("my-new-app-001");
    useEffect(() => {
        apps.mutateAsync({});
    }, []);

    return (
        <>
            <div className="flex p-3">
                <Input
                    value={name}
                    onChange={(ev) => {
                        setName(ev.target.value);
                    }}
                    className="rounded-r-none"
                ></Input>
                <Button
                    className="rounded-l-none"
                    onClick={async () => {
                        await create.mutateAsync({
                            name: name,
                        });
                        apps.mutateAsync({});
                    }}
                >
                    {`Create a new app`}
                </Button>
            </div>

            {/* <pre>{JSON.stringify(apps.data, null, "\t")}</pre> */}
        </>
    );
}
