import { Button } from "../ui/button";
import { useUnified } from "../unified/useUnified";
import { useRouter } from "next/navigation";
import { LogOutIcon, PersonStanding } from "lucide-react";
import {} from "../auth-module/useAuthUI";

export function AvatarButton() {
    return (
        <>
            <Button className=" cursor-pointer" onClick={() => {}}>
                {`更換 Avatar`}
                <PersonStanding></PersonStanding>
            </Button>
        </>
    );
}
