import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { QAvatar, QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import { Factura } from "../diseño.ts";
import { etiquetaEstadoFactura } from "../dominio.ts";
import { tCompras } from "#/compras/i18n/index.ts";

export const TarjetaFactura = (factura: Factura) => (
  <QTarjetaGenerica
    avatar={<QAvatar nombre={factura.nombreProveedor || factura.codigo} />}
    arribaIzquierda={
      factura.codigo +
      (factura.nombreProveedor ? ` · ${factura.nombreProveedor}` : "")
    }
    arribaDerecha={
      <>
        {factura.deAbono && <QEtiqueta variante="advertencia">{tCompras("comun.documento.abono")}</QEtiqueta>}
        <EtiquetaEstado {...etiquetaEstadoFactura(factura)} />
      </>
    }
    abajoIzquierda={factura.fecha ? formatearFechaDate(factura.fecha) : ""}
    abajoDerecha={formatearMoneda(factura.total, factura.divisaId)}
  />
);
