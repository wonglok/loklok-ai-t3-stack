import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";
// import { ButtonYo } from "./_core/llm-calls/createStudy";
// import { ButtonOpenAI } from "./_core/llm-calls/buttonOpenAI";
export default async function HomePage() {
    const hello = await api.post.hello({ text: "from tRPC" });

    console.log(hello);

    const session = await auth();

    if (!session?.user) {
        return redirect("/login");
    }

    return (
        <>
            <div>
                <div className="mb-3">
                    <Link prefetch href={`/apps/${session?.user?.id}/edit`}>
                        <button className="cursor-pointer rounded-2xl border bg-gray-500 p-5 text-white">
                            App Editor
                        </button>
                    </Link>
                    <Link
                        target="_blank"
                        href={`/apps/${session?.user?.id}/run`}
                    >
                        <button className="cursor-pointer rounded-2xl border bg-gray-500 p-5 text-white">
                            App Preview
                        </button>
                    </Link>
                </div>
            </div>
            <div>{/* <ButtonOpenAI></ButtonOpenAI> */}</div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-muted/50 aspect-video rounded-xl" />
                <div className="bg-muted/50 aspect-video rounded-xl" />
                <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </>
    );
}
