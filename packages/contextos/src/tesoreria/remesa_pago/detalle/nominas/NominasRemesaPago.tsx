import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { NominaDeRemesaPago } from "../../diseño.js";
import { tTesoreria } from "../../../i18n/index.ts";

const metaTablaNominas: MetaTabla<NominaDeRemesaPago> = [
  { id: "empleadoId", get cabecera() { return tTesoreria("remesa_pago.empleado"); } },
  { id: "nombreEmpleado", get cabecera() { return tTesoreria("remesa_pago.nombre"); } },
  { id: "fechaNomina", get cabecera() { return tTesoreria("remesa_pago.fNomina"); }, tipo: "fecha" },
  { id: "estado", get cabecera() { return tTesoreria("remesa_pago.estado"); } },
  { id: "importe", get cabecera() { return tTesoreria("remesa_pago.neto"); }, tipo: "moneda" },
];

export const NominasRemesaPago = ({ nominas }: { nominas: NominaDeRemesaPago[] }) => (
  <div className="NominasRemesaPago">
    <ListadoSemiControlado
      metaTabla={metaTablaNominas}
      entidades={nominas}
      totalEntidades={nominas.length}
      cargando={false}
      seleccionada={null}
      onSeleccion={() => null}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
    />
  </div>
);
