import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ReciboDeRemesaPago } from "../../diseño.js";
import { tTesoreria } from "../../../i18n/index.ts";

const metaTablaRecibos: MetaTabla<ReciboDeRemesaPago> = [
  { id: "codigo", get cabecera() { return tTesoreria("remesa_pago.codigo"); } },
  { id: "nombreProveedor", get cabecera() { return tTesoreria("remesa_pago.proveedor"); } },
  { id: "fechaVencimiento", get cabecera() { return tTesoreria("remesa_pago.fVencimiento"); }, tipo: "fecha" },
  { id: "estado", get cabecera() { return tTesoreria("remesa_pago.estado"); } },
  { id: "importe", get cabecera() { return tTesoreria("remesa_pago.importe"); }, tipo: "moneda" },
];

export const RecibosRemesaPago = ({ recibos }: { recibos: ReciboDeRemesaPago[] }) => (
  <div className="RecibosRemesaPago">
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
