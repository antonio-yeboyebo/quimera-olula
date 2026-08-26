import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { ReciboVenta } from "../diseño.js";
import { reciboPagable } from "../dominio.js";
import {
  contextoDetalleReciboVentaInicial,
  metaReciboVenta,
} from "./detalle.js";
import "./DetalleReciboVenta.css";
import { getMaquina } from "./maquina.js";
import { PagarReciboVenta } from "./pagar/PagarReciboVenta.tsx";

export const DetalleReciboVenta = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoDetalleReciboVentaInicial,
    publicar
  );

  const { uiProps } = useModelo(metaReciboVenta, ctx.recibo);

  useEffect(() => {
    emitir("recibo_id_cambiado", id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!ctx.recibo.id) return null;

  const titulo = (r: ReciboVenta) => r.codigo || `Recibo ${r.id}`;

  const acciones = [
    {
      texto: "Pagar",
      onClick: () => emitir("pagar_solicitado"),
      deshabilitado: !reciboPagable(ctx.recibo),
    },
  ];

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.recibo}
      cerrarDetalle={() => emitir("recibo_deseleccionado", null, true)}
    >
      <div className="DetalleReciboVenta">
        <QuimeraAcciones acciones={acciones} vertical />

        <quimera-formulario>
          <QInput label="Código" {...uiProps("codigo")} />
          <QInput label="Estado" {...uiProps("estado")} />
          <QInput label="Importe" {...uiProps("importe")} />
          <QInput label="Fecha de emisión" {...uiProps("fechaEmision")} />
          <QInput label="Fecha de vencimiento" {...uiProps("fechaVencimiento")} />
          <QInput label="Cliente" {...uiProps("clienteId")} />
          <QInput label="ID Fiscal" {...uiProps("idFiscal")} />
          <QInput label="Factura" {...uiProps("facturaId")} />
        </quimera-formulario>

        {ctx.estado === "PAGANDO" && <PagarReciboVenta publicar={emitir} />}
      </div>
    </Detalle>
  );
};
