import { ScanFaceIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useUnified } from "./useUnified";

export function AddPasskeyToAccountButton() {
    let jwt = useUnified((r) => r.jwt);
    return (
        <>
            {jwt && (
                <Button
                    className=" cursor-pointer"
                    onClick={() => {
                        //
                        useUnified
                            .getState()
                            .registerPasskey({ staySameScreen: true });
                        //
                    }}
                >
                    {`添加 FaceID / TouchID 登入`}
                    <ScanFaceIcon></ScanFaceIcon>
                </Button>
            )}
        </>
    );
}
