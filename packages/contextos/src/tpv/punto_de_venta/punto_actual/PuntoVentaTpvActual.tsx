import { PuntoVentaTpv as CompPuntoVentaTpv } from "#/tpv/comun/componentes/PuntoVentaTpv.tsx";
import { PropsSelectorPuesto, SelectorPuestoTpv } from "#/tpv/comun/componentes/SelectorPuestoTpv.tsx";
import { puntoVentaLocal } from "#/tpv/comun/infraestructura.ts";
import { useState } from "react";
import { PuntoVentaTpv } from "../diseño.ts";

/** Punto de venta con el que trabaja este puesto (se guarda en el navegador). */
export const PuntoVentaTpvActual = ({
  onChange,
}: {
  onChange?: () => void;
}) => {
  const [punto, setPunto] = useState<PuntoVentaTpv | null>(() => puntoVentaLocal.obtenerSeguro());

  const cambiarPuntoVenta = (nuevo: PuntoVentaTpv) => {
    puntoVentaLocal.actualizar(nuevo);
    setPunto(nuevo);
    onChange?.();
  };

  return (
    <SelectorPuestoTpv<PuntoVentaTpv>
      actual={punto}
      Selector={SelectorPunto}
      onConfirmar={cambiarPuntoVenta}
    />
  );
};

const SelectorPunto = ({ onElegir, ...props }: PropsSelectorPuesto<PuntoVentaTpv>) => (
  <CompPuntoVentaTpv
    nombre="punto_venta_actual"
    placeholder="elige punto de venta"
    condensado
    onChange={(opcion) => onElegir(opcion?.punto ?? null)}
    {...props}
  />
);
