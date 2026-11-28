import { QAvatar, QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { Proveedor } from "../diseño.ts";
import { tCompras } from "#/compras/i18n/index.ts";

export const TarjetaProveedor = (proveedor: Proveedor) => (
  <QTarjetaGenerica
    avatar={<QAvatar nombre={proveedor.nombre} />}
    arribaIzquierda={proveedor.nombre}
    arribaDerecha={
      proveedor.deBaja ? (
        <QEtiqueta variante="advertencia">{tCompras("proveedor.maestro.deBaja")}</QEtiqueta>
      ) : undefined
    }
    abajoIzquierda={proveedor.email}
    abajoDerecha={proveedor.telefono1}
  />
);
