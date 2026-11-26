import { QAvatar, QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { Articulo } from "./diseño.ts";
import { useTVentas } from "../i18n/index.ts";

export const TarjetaArticulo = (articulo: Articulo) => {
  const t = useTVentas();
  return (
    <QTarjetaGenerica
      avatar={<QAvatar nombre={articulo.descripcion} />}
      arribaIzquierda={articulo.descripcion}
      arribaDerecha={
        <>
          {articulo.pvpVariable && (
            <QEtiqueta variante="advertencia">{t("articulo.maestro.pvpVariable")}</QEtiqueta>
          )}
          {articulo.noStock && (
            <QEtiqueta variante="primario">{t("articulo.maestro.sinStock")}</QEtiqueta>
          )}
        </>
      }
      abajoIzquierda={[articulo.id, articulo.codbarras]
        .filter(Boolean)
        .join(" · ")}
      abajoDerecha={formatearMoneda(articulo.precio, "EUR")}
    />
  );
};
