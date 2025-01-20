import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import * as THREE from "three";

export function TopRight() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        if (meshRef.current) {
            const tl = gsap.timeline({ paused: true, onComplete: () => Testing(), repeat: -1 });
            tl.to(meshRef.current.position, {
                x: 0.9,
                y: 0.9,
                z: 2,
                duration: 2,
            });
            // tl.to(meshRef.current.position, {
            //     // x: 0,
            //     // y: 2,
            //     // z: 2,
            //     // duration: 2.5,
            // });
            timelineRef.current = tl;
            tl.play(); 
        }
    }, []); 

    function Testing() {
        // meshRef.current.visible = false;
        meshRef.current.position.set(0,0,0);
    }

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <ringGeometry args={[1, 1.2, 30, 10, 0, Math.PI/2]}/>
            <meshStandardMaterial color="hotpink" />
        </mesh>
    );
}
