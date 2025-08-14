import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { RestURL } from "../../../../../branding-config/Connections";
import { useAppTable } from "./useAppTable";
import { useUnified } from "@/components/unified/useUnified";
import { AppTableClient } from "./AppTableClient";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

function AddApp() {
    let [appTitle, setTitle] = useState("");
    return (
        <form
            onSubmit={async (ev) => {
                ev.preventDefault();

                console.log(appTitle);

                let resp = await fetch(
                    `${new URL("/app/crud/create", RestURL)}`,
                    //
                    {
                        method: "POST",
                        mode: "cors",
                        headers: {
                            jwt: useUnified.getState().jwt,
                        },
                        body: JSON.stringify({
                            //
                            title: appTitle,
                            privacy: "private",
                            updatedAt: new Date().toISOString(),
                            createdAt: new Date().toISOString(),
                        }),
                    }
                );

                if (resp.ok) {
                    let json = await resp.json();

                    console.log(json);

                    AppTableClient["list-my"]();
                } else {
                    let text = await resp.text();

                    console.log(text);
                }

                //
            }}
            className="flex w-full max-w-sm items-center gap-2 mb-2"
        >
            <Input
                type="text"
                className="appTitle"
                required
                placeholder="New App Title"
                value={appTitle}
                onChange={(ev) => {
                    setTitle(ev.target.value);
                }}
            />
            <Button type="submit" variant="outline">
                Create App
            </Button>
        </form>
    );
}

function ListApps() {
    let apps = useAppTable((r) => r.apps);
    let loading = useAppTable((r) => r.loading);

    useEffect(() => {
        //
        AppTableClient["list-my"]();
        //
    }, []);

    return (
        <>
            <Table>
                <TableCaption>
                    {loading ? `My AI Apps` : `My AI Apps`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Created At</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="w-[80px]">Visibility</TableHead>
                        <TableHead className="text-right w-[80px]">
                            Action
                        </TableHead>
                    </TableRow>
                </TableHeader>
                {/*  */}
                {/*  */}
                <TableBody>
                    {apps.map((app: any) => {
                        return <EachRow key={app.itemID} app={app}></EachRow>;
                    })}
                </TableBody>
            </Table>
        </>
    );
}

//

function EachRow({ app }: { app: Record<string, any> }) {
    let router = useRouter();
    let date = format(new Date(app.createdAt), "yyyy-mm-dd h:m bbb");

    return (
        <TableRow>
            <TableCell className="font-medium">{`${date}`}</TableCell>
            <TableCell>{`${app.title}`}</TableCell>
            <TableCell className=" first-letter:capitalize">
                {app.privacy}
            </TableCell>
            <TableCell className="text-right">
                <Button
                    className=" cursor-pointer"
                    onClick={() => {
                        //

                        //
                        router.push(`/app-editor/${app.itemID}`);
                        //
                    }}
                >
                    Edit
                </Button>
            </TableCell>
        </TableRow>
    );
}

export function AppTable() {
    return (
        <>
            <AddApp></AddApp>
            <ListApps></ListApps>
        </>
    );
}
