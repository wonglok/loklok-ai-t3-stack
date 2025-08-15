// import { auth } from "@/server/auth";
// import { api, HydrateClient } from "@/trpc/server";
// import Link from "next/link";
// import { redirect } from "next/navigation";

import { redirect } from "next/navigation";

// export default async function Home() {
//     const hello = await api.post.hello({ text: "from tRPC" });
//     const session = await auth();

//     if (!session?.user) {
//         return (
//             <HydrateClient>
//                 <>not logged in</>
//             </HydrateClient>
//         );
//     }

//     if (session?.user) {
//         void api.post.getLatest.prefetch();
//     }

//     return (
//         <HydrateClient>
//             <>
//                 {/*  */}
//                 welcome home {session.user.name}
//                 <div>
//                     <Link
//                         href={
//                             session ? "/api/auth/signout" : "/api/auth/signin"
//                         }
//                         className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
//                     >
//                         {session ? "Sign out" : "Sign in"}
//                     </Link>
//                 </div>
//                 {/*  */}
//             </>
//         </HydrateClient>
//     );
// }

export default function Page() {
    redirect("/admin");
}
