"use client";

import * as React from "react";
import {
    AudioWaveform,
    BookOpen,
    Bot,
    CodeIcon,
    Command,
    CommandIcon,
    Frame,
    GalleryVerticalEnd,
    Map,
    MoreHorizontal,
    PieChart,
    Server,
    Settings2,
    SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { AppSwitcher } from "@/components/team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { create } from "zustand";

export const useDeveloperTools = create<any>(() => {
    return {
        //
        currentSlug: "",
        //
        projects: [],
    };
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    let { slug } = useParams();
    let pathname = usePathname();
    // let projects = useDeveloperTools((r) => r.projects);

    let data = {
        user: {
            name: "loklok",
            email: "Thank you Jesus!",
            avatar: `/loklok-asset/emoji/star-struck-emoji-icon.svg`,
        },

        dashboard: [
            {
                name: "Home",
                url: `/`,
                icon: CommandIcon,
            },
            {
                name: "Dasboard",
                url: `/developer`,
                icon: CommandIcon,
            },
        ],
        navMain: [
            {
                title: "Backend",
                url: `/developer`,
                icon: Server,
                isActive: [`/developer/generator`].some((s) =>
                    pathname.startsWith(s),
                ),
                items: [
                    {
                        title: "Spec and Code Generator",
                        url: `/developer/generator`,
                    },
                ],
            },

            // {
            //     title: "Frontend",
            //     url: `/developer/frontend",
            //     icon: CodeIcon,

            //     isActive: window.location.pathname.startsWith(
            //         `/developer/${slug}/frontend"
            //     ),
            //     items: [
            //         {
            //             title: "3D Editor",
            //             url: `/developer/${slug}/frontend/editor",
            //         },
            //         {
            //             title: "Landing Page Editor",
            //             url: `/developer/${slug}/frontend/landing-page",
            //         },
            //     ],
            // },
            // {
            //     title: "Documentation",
            //     url: `/developer/${slug}`,
            //     icon: BookOpen,
            //     items: [
            //         {
            //             title: "Introduction",
            //             url: `/developer/${slug}`,
            //         },
            //         {
            //             title: "Get Started",
            //             url: `/developer/${slug}`,
            //         },
            //         {
            //             title: "Tutorials",
            //             url: `/developer/${slug}`,
            //         },
            //         {
            //             title: "Changelog",
            //             url: `/developer/${slug}`,
            //         },
            //     ],
            // },
            // {
            //     title: "Settings",
            //     url: `/developer/${slug}`,
            //     icon: Settings2,
            //     items: [
            //         {
            //             title: "General",
            //             url: `/developer/${slug}`,
            //         },
            //         {
            //             title: "Team",
            //             url: `/developer/${slug}`,
            //         },
            //         {
            //             title: "Billing",
            //             url: `/developer/${slug}`,
            //         },
            //         {
            //             title: "Limits",
            //             url: `/developer/${slug}`,
            //         },
            //     ],
            // },
            //
            //
            //
            //
        ],
        projects: [
            {
                name: "Design Engineering",
                url: `/developer/${slug}`,
                icon: Frame,
            },
            {
                name: "Sales & Marketing",
                url: `/developer/${slug}`,
                icon: PieChart,
            },
            {
                name: "Travel",
                url: `/developer/${slug}`,
                icon: Map,
            },
        ],
        //
    };

    return (
        <>
            {data ? (
                <>
                    <Sidebar collapsible="icon" {...props}>
                        <SidebarHeader>
                            {
                                <AppSwitcher
                                    projects={[
                                        {
                                            name: `Developer Tools`,
                                            slug: `app`,
                                            logo: Command,
                                            plan: "AI Vibe Coding",
                                        },
                                    ]}

                                    //   projects={projects
                                    // .filter((r: any) => r)
                                    // .map((it: any) => {
                                    //     return {
                                    //         name: it.name,
                                    //         slug: it.slug,
                                    //         logo: Command,
                                    //         plan: "Vibe Coding",
                                    //     };
                                    // })}
                                />
                            }
                        </SidebarHeader>
                        <SidebarContent>
                            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                                <SidebarGroupLabel>
                                    Welcome back!
                                </SidebarGroupLabel>
                                <SidebarMenu>
                                    {data.dashboard.map(
                                        (item: {
                                            name: string;
                                            url: string;
                                            icon: any;
                                        }) => (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={item.url}>
                                                        <item.icon />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ),
                                    )}
                                </SidebarMenu>
                            </SidebarGroup>
                            <NavMain items={data.navMain} />
                            {/* <Navprojects projects={data.projects} /> */}
                        </SidebarContent>
                        <SidebarFooter>
                            <NavUser user={data.user} />
                        </SidebarFooter>
                        <SidebarRail />
                    </Sidebar>
                </>
            ) : (
                <>
                    <Sidebar collapsible="icon" {...props}></Sidebar>
                </>
            )}
        </>
    );
}
