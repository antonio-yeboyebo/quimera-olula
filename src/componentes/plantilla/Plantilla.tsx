import { PropsWithChildren } from "react";
import { MenuLateral } from "../menu/menu-lateral.tsx";
import { Slot } from "../slot/Slot.tsx";
import { Cabecera } from "./Cabecera.tsx";
import { Pie } from "./Pie.tsx";
import "./Plantilla.css";

export const Plantilla = ({ children }: PropsWithChildren<object>) => {
  const slots = { hijos: children };

  return (
    <>
      <Slot nombre="cabecera" {...slots}>
        <Cabecera />
      </Slot>

      <section role="main">
        <MenuLateral />
        <Slot {...slots} />
      </section>

      <Slot nombre="pie" {...slots}>
        <Pie />
      </Slot>
    </>
  );
};
