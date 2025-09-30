import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function MailBox(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Mailbox.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Mailbox.glb");
