import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { MovimientoRemesa, Remesa } from "../../diseño.js";
import { remesaConPago, remesaPagable } from "../../dominio.js";
import { tTesoreria } from "../../../i18n/index.ts";

const metaTablaPagos: MetaTabla<MovimientoRemesa> = [
  { id: "fecha", get cabecera() { return tTesoreria("remesa.fecha"); }, tipo: "fecha" },
  { id: "tipo", get cabecera() { return tTesoreria("remesa.tipo"); } },
];

export const PagosRemesa = ({
  remesa,
  publicar,
}: {
  remesa: Remesa;
  publicar: EmitirEvento;
}) => (
  <div className="PagosRemesa">
    <ListadoSemiControlado
      metaTabla={metaTablaPagos}
      entidades={remesa.pagos}
      totalEntidades={remesa.pagos.length}
      cargando={false}
      seleccionada={null}
      onSeleccion={() => null}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
      renderAcciones={() => (
        <div className="maestro-botones">
          {remesaPagable(remesa) && (
            <QBoton onClick={() => publicar("pago_solicitado")}>{tTesoreria("remesa.pagar")}</QBoton>
          )}
          {remesaConPago(remesa) && (
            <QBoton
              advertencia
              onClick={() => publicar("deshacer_pago_solicitado")}
            >
              {tTesoreria("remesa.deshacerPago")}
            </QBoton>
          )}
        </div>
      )}
    />
  </div>
);
