import { textoIncidencia } from "#/tesoreria/cobro_online/dominio.ts";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { MovimientoRecibo } from "../../diseño.js";

const NOMBRE_PASARELA: Record<string, string> = { stripe: "Stripe" };

/** El pago o reembolso en la pasarela (Stripe): enlace a su panel y lo que haya que revisar. */
const Pasarela = ({ pago }: { pago: MovimientoRecibo }) => {
  if (!pago.pasarela) return null;
  const nombre =
    (NOMBRE_PASARELA[pago.pasarela] ?? pago.pasarela) +
    (pago.modoPasarela === "test" ? " (test)" : "");

  return (
    <span className="pasarela">
      {pago.urlPanel ? (
        <a
          href={pago.urlPanel}
          target="_blank"
          rel="noopener noreferrer"
          title={`Abrir el pago en el panel de ${nombre}`}
        >
          {nombre}
          <QIcono nombre="arriba_derecha" tamaño="sm" />
        </a>
      ) : (
        nombre
      )}
      {pago.incidenciaPasarela && (
        <span className="incidencia">{textoIncidencia(pago.incidenciaPasarela)}</span>
      )}
    </span>
  );
};

const metaTablaPagos: MetaTabla<MovimientoRecibo> = [
  { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
  { id: "tipo", cabecera: "Tipo", tipo: "texto" },
  { id: "estado", cabecera: "Estado", tipo: "booleano" },
  {
    id: "pasarela",
    cabecera: "Tarjeta",
    render: (pago) => <Pasarela pago={pago} />,
  },
];

export const PagosReciboVenta = ({ pagos }: { pagos: MovimientoRecibo[] }) => {
  return (
    <div className="PagosReciboVenta">
      <h3>Pagos y devoluciones</h3>

      <ListadoSemiControlado
        metaTabla={metaTablaPagos}
        entidades={pagos}
        totalEntidades={pagos.length}
        cargando={false}
        seleccionada={null}
        onSeleccion={() => null}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
      />
    </div>
  );
};
