import { QTarjetaGenerica } from "@olula/componentes/index.js";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import {
  desgloseLineaVenta,
  fiscalidadLineaVenta,
  tituloLineaVenta,
  type LineaVentaTarjeta,
} from "./linea_venta_texto.ts";
import "./TarjetaLineaVenta.css";
import { useTVentas } from "../../i18n/index.ts";

export type { LineaVentaTarjeta };

export const TarjetaLineaVenta = <L extends LineaVentaTarjeta>({
  linea,
  cantidadEditable = false,
  onCambioCantidad,
  divisa = "EUR",
}: {
  linea: L;
  cantidadEditable?: boolean;
  onCambioCantidad?: (linea: L, cantidad: number) => void;
  divisa?: string;
}) => {
  const t = useTVentas();
  const cantidad = Number(linea.cantidad) || 0;
  const [cantidadInput, setCantidadInput] = useState(String(cantidad));

  const permitirEditarCantidad = cantidadEditable && onCambioCantidad;

  const titulo = tituloLineaVenta(linea);
  const desglose = desgloseLineaVenta(linea, divisa);
  const ivaTexto = fiscalidadLineaVenta(linea, divisa);

  useEffect(() => {
    setCantidadInput(String(cantidad));
  }, [cantidad]);

  const actualizarCantidad = (nuevaCantidad: number) => {
    if (!permitirEditarCantidad) return;

    const cantidadValida = Math.max(1, Math.floor(nuevaCantidad));
    setCantidadInput(String(cantidadValida));
    if (cantidadValida !== cantidad) {
      onCambioCantidad(linea, cantidadValida);
    }
  };

  const confirmarCantidadInput = (valorRaw?: string) => {
    const parsed = Number(valorRaw ?? cantidadInput);
    if (!Number.isFinite(parsed)) {
      setCantidadInput(String(cantidad));
      return;
    }
    actualizarCantidad(parsed);
  };

  const stepper = (
    <div
      className="linea-venta-stepper"
      onClick={(e) => e.stopPropagation()}
    >
      <QBoton
        variante="borde"
        tamaño="pequeño"
        onClick={() => actualizarCantidad(cantidad - 1)}
        props={{ "aria-label": t("comun.linea.disminuirCantidad") }}
      >
        -
      </QBoton>
      <div className="linea-venta-stepper-input">
        <QInput
          label=""
          nombre="cantidad"
          tipo="numero"
          valor={cantidadInput}
          autoSeleccion
          onChange={(valor) => setCantidadInput(valor)}
          onBlur={(valor) => confirmarCantidadInput(valor)}
          onEnterKeyUp={(valor) => confirmarCantidadInput(valor)}
        />
      </div>
      <QBoton
        variante="borde"
        tamaño="pequeño"
        onClick={() => actualizarCantidad(cantidad + 1)}
        props={{ "aria-label": t("comun.linea.aumentarCantidad") }}
      >
        +
      </QBoton>
    </div>
  );

  return (
    <QTarjetaGenerica
      arribaIzquierda={titulo}
      arribaDerecha={formatearMoneda(linea.pvp_total, divisa)}
      abajoIzquierda={permitirEditarCantidad ? stepper : desglose}
      abajoDerecha={ivaTexto}
    />
  );
};
