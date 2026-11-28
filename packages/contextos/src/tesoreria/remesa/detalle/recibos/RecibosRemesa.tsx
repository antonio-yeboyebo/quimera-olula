import { varianteEstadoReciboVenta } from "#/tesoreria/recibo_venta/dominio.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ReciboDeRemesa } from "../../diseño.js";
import { tTesoreria } from "../../../i18n/index.ts";
import { textoEstado } from "../../../comun/estados.ts";

const metaTablaRecibos: MetaTabla<ReciboDeRemesa> = [
  { id: "codigo", get cabecera() { return tTesoreria("remesa.codigo"); } },
  { id: "nombreCliente", get cabecera() { return tTesoreria("remesa.cliente"); } },
  { id: "fechaVencimiento", get cabecera() { return tTesoreria("remesa.fVencimiento"); }, tipo: "fecha" },
  {
    id: "estado",
    get cabecera() { return tTesoreria("remesa.estado"); },
    render: (recibo: ReciboDeRemesa) => (
      <QEtiqueta variante={varianteEstadoReciboVenta(recibo.estado)}>
        {textoEstado(recibo.estado)}
      </QEtiqueta>
    ),
  },
  { id: "situacion", get cabecera() { return tTesoreria("remesa.situacion"); } },
  { id: "importe", get cabecera() { return tTesoreria("remesa.importe"); }, tipo: "moneda" },
];

export const RecibosRemesa = ({ recibos }: { recibos: ReciboDeRemesa[] }) => (
  <div className="RecibosRemesa">
    <ListadoSemiControlado
      metaTabla={metaTablaRecibos}
      entidades={recibos}
      totalEntidades={recibos.length}
      cargando={false}
      seleccionada={null}
      onSeleccion={() => null}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
    />
  </div>
);
