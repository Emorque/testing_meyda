import { useRef, useEffect } from "react";
// import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import * as THREE from "three";

export function CanTemp() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        if (meshRef.current) {
            const tl = gsap.timeline({ paused: true, onComplete: () => Testing(), repeat: -1 });
            tl.to(meshRef.current.position, {
                x: 0,
                y: 1,
                z: 1,
                duration: 2.5,
            });
            tl.to(meshRef.current.position, {
                x: 0,
                y: 2,
                z: 2,
                duration: 2.5,
            });
            timelineRef.current = tl;
            tl.play(); 
        }
    }, []); 

    function Testing() {
        // meshRef.current.visible = false;
        meshRef.current.position.set(0,0,0);
    }

    // useFrame(() => {
    //     if (timelineRef.current && timelineRef.current.paused()) {
    //         timelineRef.current.play();
    //     }
    // });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <sphereGeometry />
            <meshStandardMaterial color="hotpink" />
        </mesh>
    );
}
