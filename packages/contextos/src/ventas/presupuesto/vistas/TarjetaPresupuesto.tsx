import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { Link } from "react-router";
import { Presupuesto } from "../diseño.ts";
import "./TarjetaPresupuesto.css";
import { useTVentas } from "../../i18n/index.ts";

export const TarjetaPresupuesto = (presupuesto: Presupuesto) => {
  const t = useTVentas();
  // El listado recibe el nombre del cliente aplanado desde la API; el tipo lo
  // expone anidado en `cliente`, así que contemplamos ambas procedencias.
  const nombreCliente =
    (presupuesto as unknown as { nombre_cliente?: string }).nombre_cliente ??
    presupuesto.cliente?.nombre_cliente ??
    "-";

  return (
    <article className="TarjetaPresupuesto">
      <QTarjetaGenerica
        arribaIzquierda={
          <span className="tarjeta-presupuesto-codigo">
            {presupuesto.codigo || "-"}
          </span>
        }
        arribaDerecha={
          <QEtiqueta className="tarjeta-presupuesto-total">
            {formatearMoneda(presupuesto.total ?? 0, "EUR")}
          </QEtiqueta>
        }
        abajoIzquierda={
          <span className="tarjeta-presupuesto-cliente">{nombreCliente}</span>
        }
        abajoDerecha={
          <Link
            to={`/ventas/presupuesto?id=${presupuesto.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <QBoton tamaño="pequeño" variante="texto">
              {t("presupuesto.verPresupuesto")}
            </QBoton>
          </Link>
        }
      />
    </article>
  );
};
