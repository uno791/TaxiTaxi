import { useGLTF, Clone } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import type { JSX } from "react/jsx-runtime";
import * as THREE from "three";

type MissionZoneProps = JSX.IntrinsicElements["group"] & {
  /** Detection radius in world units. Defaults to 2.5 */
  radius?: number;
  /** Allowable vertical separation between taxi and zone */
  heightTolerance?: number;
  /** Toggle detection on/off without unmounting */
  active?: boolean;
  /** Optional reference to the taxi object for precise tracking */
  taxiRef?:
    | RefObject<THREE.Object3D | null>
    | MutableRefObject<THREE.Object3D | null>;
  /** Called once when the taxi enters the zone */
  onTaxiEnter?: () => void;
  /** Called every frame while the taxi remains inside the zone */
  onTaxiStay?: () => void;
  /** Called once when the taxi leaves the zone */
  onTaxiExit?: () => void;
  /** Keep the zone mesh visible even when inactive */
  visibleWhenInactive?: boolean;
};

export function MissionZone({
  radius = 2.5,
  heightTolerance = 6,
  active = true,
  taxiRef,
  onTaxiEnter,
  onTaxiStay,
  onTaxiExit,
  visibleWhenInactive = false,
  ...groupProps
}: MissionZoneProps) {
  const { scene } = useGLTF("/models/Glass.glb");
  const { scene: rootScene } = useThree();

  const zoneRef = useRef<THREE.Group>(null);
  const vehicleRef = useRef<THREE.Object3D | null>(null);
  const isInsideRef = useRef(false);

  const zonePosition = useMemo(() => new THREE.Vector3(), []);
  const taxiPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!active) {
      if (isInsideRef.current) {
        isInsideRef.current = false;
        onTaxiExit?.();
      }
      return;
    }

    if (taxiRef?.current) {
      vehicleRef.current = taxiRef.current;
    } else if (!vehicleRef.current) {
      vehicleRef.current = rootScene.getObjectByName("vehicle") ?? null;
    }

    const zone = zoneRef.current;
    const vehicle = vehicleRef.current;
    if (!zone || !vehicle) return;

    zone.updateMatrixWorld(true);
    vehicle.updateMatrixWorld(true);
    zone.getWorldPosition(zonePosition);
    vehicle.getWorldPosition(taxiPosition);

    const horizontalDistance = Math.hypot(
      zonePosition.x - taxiPosition.x,
      zonePosition.z - taxiPosition.z
    );
    const verticalSeparation = Math.abs(zonePosition.y - taxiPosition.y);
    const inside =
      horizontalDistance <= radius && verticalSeparation <= heightTolerance;

    if (inside) {
      if (!isInsideRef.current) {
        isInsideRef.current = true;
        onTaxiEnter?.();
      }
      onTaxiStay?.();
    } else if (isInsideRef.current) {
      isInsideRef.current = false;
      onTaxiExit?.();
    }
  });

  return (
    <group
      ref={zoneRef}
      visible={active || visibleWhenInactive}
      {...groupProps}
    >
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Glass.glb");
