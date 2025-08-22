import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function layout({ children, params }) {
    const session = await auth();

    let { appID } = await params;

    if (!session?.user) {
        // signIn("google", {
        //     redirect: true,
        //     redirectTo: `/apps/${appID}/edit`,
        // });

        return redirect(
            `/api/auth/signin?redirect=${appID ? encodeURIComponent(`/apps/${appID}/edit`) : "/"}`,
        );
    }

    return <>{children}</>;
}
