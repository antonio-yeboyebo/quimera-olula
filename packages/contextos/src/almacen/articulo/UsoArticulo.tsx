import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { Articulo } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

export const UsoArticulo = (articulo: Articulo) => (
  <>
    <QEtiqueta variante={articulo.seVende ? "exito" : "advertencia"}>
      {tAlmacen("articulo.venta")}
    </QEtiqueta>{" "}
    <QEtiqueta variante={articulo.seCompra ? "exito" : "advertencia"}>
      {tAlmacen("articulo.compra")}
    </QEtiqueta>{" "}
    {articulo.noStock && <QEtiqueta variante="error">{tAlmacen("articulo.sinStock")}</QEtiqueta>}
  </>
);
