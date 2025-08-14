import { Button } from "../ui/button";
import { useUnified } from "../unified/useUnified";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { useAuthUI } from "../auth-module/useAuthUI";

export function LogoutButton() {
    let router = useRouter();
    return (
        <>
            <Button
                className=" cursor-pointer"
                onClick={() => {
                    useAuthUI.setState({
                        overlay: "",
                    });
                    useUnified.getState().logout();

                    router.push("/");
                }}
            >
                {`登出`}
                <LogOutIcon></LogOutIcon>
            </Button>
        </>
    );
}
