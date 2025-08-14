import { useUI } from "@/game/GameCanvas";
import { useLoadFBXActions } from "@/game/useLoadFBXActions";
import { useLoadGLB } from "@/game/useLoadGLB";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ReactNode, useEffect, useMemo } from "react";
import { Bone, Object3D, Vector3 } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export function Avatar({
    title,
    motionURL,
    avatarURL,
    lookAtCamera = false,
}: {
    title?: ReactNode;
    motionURL: string;
    avatarURL: string;
    lookAtCamera?: boolean;
}) {
    let glbAPI = useLoadGLB({
        castShadow: true,
        enableCache: false,
        url: avatarURL + `?&r=${encodeURIComponent(motionURL)}`,
    });

    let actions = useLoadFBXActions({
        o3d: glbAPI.o3d,
        defaultMotion: motionURL + `?&r=${encodeURIComponent(glbAPI.o3d.uuid)}`,
    });

    useEffect(() => {
        actions.defaultMotion.canRun = true;
        actions.defaultMotion.reset().play();
    }, []);

    let showingOverlay = useUI((r) => r.showingOverlay);

    let p3 = new Vector3();
    useFrame(({ camera }) => {
        glbAPI.o3d.getWorldPosition(p3);

        if (lookAtCamera) {
            glbAPI.o3d.traverse((it: Object3D | Bone | any) => {
                //
                if (it?.isBone && it.name.toLowerCase() === "head") {
                    it.lookAt(camera.position);
                }
            });
        }
    });

    return (
        <>
            {title && !showingOverlay && (
                <group position={[0, 3, 0]}>
                    <Html
                        transform
                        // occlude="blending"
                        rotation={[-0.35, 0, 0]}
                        className="rounded-2xl"
                    >
                        {title}
                    </Html>
                </group>
            )}

            <group>{<primitive object={glbAPI.o3d}></primitive>}</group>
        </>
    );
}
