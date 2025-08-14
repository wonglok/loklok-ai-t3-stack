"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { v4 } from "uuid";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useDeveloperTools } from "./app-sidebar";

export function AppSwitcher({
    projects,
}: {
    projects: {
        name: string;
        slug: string;
        logo: any;
        plan: string;
    }[];
}) {
    let router = useRouter();
    let { slug } = useParams();
    // console.log("projects", projects);

    const { isMobile } = useSidebar();

    let activeTeam = projects.find((r) => r.slug === slug);

    activeTeam = projects[0];

    if (!activeTeam) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <activeTeam.logo className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {activeTeam.name}
                                </span>
                                <span className="truncate text-xs">
                                    {activeTeam.plan}
                                </span>
                            </div>
                            {/* <ChevronsUpDown className="ml-auto" /> */}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    {/* <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Projects
                        </DropdownMenuLabel>
                        {projects.map((team, index) => (
                            <DropdownMenuItem
                                key={team.slug + team.name}
                                onClick={() => {
                                    router.push(`/developer/${team.slug}`);
                                }}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <team.logo className="size-3.5 shrink-0" />
                                </div>
                                {team.name}
                                <DropdownMenuShortcut>
                                    ⌘{index + 1}
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="gap-2 p-2"
                            onClick={async () => {
                                //
                                let res = await fetch(
                                    `http://localhost:8390/new-project`,
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            name: "New App",
                                        }),
                                    }
                                );
                                let data = await res.json();

                                await fetch(`http://localhost:8390/all-data`, {
                                    method: "GET",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                }).then((r) => {
                                    if (r.ok) {
                                        return r.json().then((v) => {
                                            useDeveloperTools.setState({
                                                projects: v.projects,
                                            });
                                        });
                                    }
                                });

                                router.push(`/developer/${data.slug}`);

                                //
                            }}
                        >
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground font-medium">
                                Add Project
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent> */}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
