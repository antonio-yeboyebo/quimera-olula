import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { FormModelo } from "@olula/lib/dominio.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.ts";
import { ArticuloProveedor } from "../../articulo_proveedor/diseño.ts";
import { Articulo } from "../diseño.ts";
import { EstadoDetalleArticulo } from "./diseño.ts";
import { PreciosProveedorArticulo } from "./precios_proveedor/PreciosProveedorArticulo.tsx";
import "./TabCompras.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const TabCompras = ({
  form,
  articulo,
  precios,
  estado,
  publicar,
}: {
  form: FormModelo;
  articulo: Articulo;
  precios: ListaEntidades<ArticuloProveedor>;
  estado: EstadoDetalleArticulo;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const { uiProps } = form;

  return (
    <div className="TabCompras">
      <quimera-formulario>
        <GrupoIvaProducto {...uiProps("grupoIvaProductoId")} />
      </quimera-formulario>
      <h3>{t("articulo.detalle.preciosProveedor")}</h3>
      <PreciosProveedorArticulo
        articulo={articulo}
        precios={precios}
        estado={estado}
        publicar={publicar}
      />
    </div>
  );
};
