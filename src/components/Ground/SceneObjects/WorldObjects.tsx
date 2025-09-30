import type { JSX } from "react/jsx-runtime";
import { Cone } from "./Cone";
import { Dumpster } from "./Dumpster";
import { FlowerPotA } from "./FlowerPotA";
import { FlowerPotB } from "./FlowerPotB";
import { FireHydrant } from "./FireHydrant";
import { MailBox } from "./MailBox";
import { ManHole } from "./ManHole";
import { Paper } from "./Paper";
import { Planter } from "./Planter";
import { StreetLight } from "./StreetLight";
import { TrashBag } from "./TrashBag";
import { TreeA } from "./TreeA";
import { TreeB } from "./TreeB";
import { Bush } from "./Bush";
import { Billboard } from "./Billboard";
export default function WorldObjects(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <Billboard
          position={[43, 0, -38]}
          scale={0.005}
          rotation={[0, Math.PI / 3, 0]}
        />
        <ManHole position={[26, 0.1, 2]} scale={2} rotation={[0, 0, 0]} />
        <Cone position={[26.7, 0.1, 2.6]} scale={0.5} />
        <Cone position={[26, 0.1, 2.86]} scale={0.5} />
        <Cone position={[26, 0.1, 1.1]} scale={0.5} />
        <Cone position={[25.2, 0.1, 2.6]} scale={0.5} />
        <Cone position={[25.2, 0.1, 1.6]} scale={0.5} />
        <Cone position={[26.8, 0.1, 1.6]} scale={0.5} />
        <Bush position={[26, 0.2, -0.9]} scale={3.5} />
        <Bush position={[26.4, 0.2, -1.1]} scale={3} />
        <Bush position={[26, 0.2, -1.4]} scale={4} />
        <Bush position={[26.4, 0.2, -1.5]} scale={3} />
        <TreeB position={[26, 1.8, -1]} scale={1} />
        <MailBox position={[26, 0, -5.5]} scale={1.2} />
        <MailBox position={[26.24, 0, -5.5]} scale={1.2} />
        <Paper position={[25.5, 0.05, -5.5]} scale={0.7} />
        <Paper
          position={[26.65, 0.05, -5.5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.7}
        />
        <FireHydrant
          position={[26.7, 0, -6.5]}
          scale={0.003}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <TreeA position={[26, 0, -9]} scale={0.005} />
        <TreeA
          position={[26, 0, -11]}
          scale={0.005}
          rotation={[0, Math.PI * 1.5, 0]}
        />

        <TreeA
          position={[26, 0, -15]}
          scale={0.005}
          rotation={[0, Math.PI / 3, 0]}
        />
        <TreeA
          position={[26, 0, -17]}
          scale={0.005}
          rotation={[0, Math.PI / 3, 0]}
        />
        <TreeB position={[26, 1.8, -13]} scale={1} />
        <Bush position={[26, 0.2, -14]} scale={3} />
        <Bush
          position={[26, 0.2, -12]}
          scale={3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Bush
          position={[26, 0.2, -10]}
          scale={3}
          rotation={[0, Math.PI / 3, 0]}
        />
        <Bush position={[26, 0.2, -16]} scale={3} rotation={[0, Math.PI, 0]} />
        <Bush
          position={[26, 0.2, -18.2]}
          scale={3}
          rotation={[0, Math.PI, 0]}
        />
        <TreeB
          position={[27, 1.8, -18.3]}
          scale={1}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <TreeB position={[29, 1.8, -17.8]} scale={1} rotation={[0, 0, 0]} />
        <TreeB
          position={[31, 1.8, -17.8]}
          scale={1}
          rotation={[0, Math.PI / 2, 0]}
        />
        <TreeB
          position={[33, 1.8, -18.5]}
          scale={1}
          rotation={[0, Math.PI, 0]}
        />
        <TreeB
          position={[35, 1.8, -18.5]}
          scale={1}
          rotation={[0, Math.PI, 0]}
        />
        <TreeB position={[37, 1.8, -17.8]} scale={1} rotation={[0, 0, 0]} />
        <Bush
          position={[28, 0.2, -18.1]}
          scale={3}
          rotation={[0, Math.PI, 0]}
        />
        <Bush
          position={[30, 0.2, -18.1]}
          scale={3}
          rotation={[0, Math.PI, 0]}
        />
        <Bush
          position={[32, 0.2, -18.1]}
          scale={3}
          rotation={[0, Math.PI, 0]}
        />
        <Bush
          position={[34, 0.2, -18.2]}
          scale={3}
          rotation={[0, Math.PI, 0]}
        />
        <Bush
          position={[36, 0.2, -18.2]}
          scale={3}
          rotation={[0, Math.PI, 0]}
        />
        <TrashBag position={[38, 0.2, -18.2]} scale={1} />
        <TrashBag position={[38, 0.2, -18]} scale={1.3} />
        <TrashBag position={[38, 0.2, -17.8]} scale={1.2} />
        <TrashBag position={[38.3, 0.2, -18]} scale={1.6} />
        <Dumpster position={[-13, 0, -10]} scale={0.5} />
        <Dumpster position={[-14.2, 0, -10]} scale={0.5} />
        <TrashBag position={[-14.2, 0, -9.5]} scale={1.6} />
        <TrashBag position={[-13.7, 0.1, -9.5]} scale={1.6} />
        <TrashBag position={[-14.5, 0.2, -9.5]} scale={1.6} />
        <TrashBag position={[-14.97, 0.2, -9.7]} scale={1.6} />
        <TrashBag position={[-14.8, 0.1, -9.3]} scale={1.6} />
        <TrashBag position={[-13, 0.1, -9.5]} scale={1.6} />
        <TrashBag position={[-12.7, 0, -9.5]} scale={1.6} />
        <Billboard
          position={[-24.5, 0, -10]}
          scale={0.005}
          rotation={[0, Math.PI, 0]}
        />
      </group>
    </group>
  );
}
