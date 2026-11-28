import { DetalleAlbaran } from "#/compras/albaran/detalle/DetalleAlbaran.tsx";
import { Albaran } from "#/compras/albaran/diseño.ts";
import { getAlbaranes } from "#/compras/albaran/infraestructura.ts";
import { metaTablaAlbaran } from "#/compras/albaran/maestro/metatabla_albaran.tsx";
import { TarjetaAlbaran } from "#/compras/albaran/maestro/TarjetaAlbaran.tsx";
import { DetalleFactura } from "#/compras/factura/detalle/DetalleFactura.tsx";
import { Factura } from "#/compras/factura/diseño.ts";
import { getFacturas } from "#/compras/factura/infraestructura.ts";
import { metaTablaFactura } from "#/compras/factura/maestro/metatabla_factura.tsx";
import { TarjetaFactura } from "#/compras/factura/maestro/TarjetaFactura.tsx";
import { DetallePedido } from "#/compras/pedido/detalle/DetallePedido.tsx";
import { Pedido } from "#/compras/pedido/diseño.ts";
import { getPedidos } from "#/compras/pedido/infraestructura.ts";
import { metaTablaPedido } from "#/compras/pedido/maestro/metatabla_pedido.tsx";
import { TarjetaPedido } from "#/compras/pedido/maestro/TarjetaPedido.tsx";
import { DocumentosTercero } from "#/comun/componentes/documentos_tercero/DocumentosTercero.tsx";
import { ordenDocumentos } from "#/comun/componentes/documentos_tercero/dominio.ts";
import { TarjetaRecibo } from "#/comun/componentes/documentos_tercero/TarjetaRecibo.tsx";
import { DetalleReciboCompra } from "#/tesoreria/recibo_compra/detalle/DetalleReciboCompra.tsx";
import { ReciboCompra } from "#/tesoreria/recibo_compra/diseño.ts";
import { getRecibosCompra } from "#/tesoreria/recibo_compra/infraestructura.ts";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ClausulaFiltro, Entidad } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useMemo, useState } from "react";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";
import { ESTADOS_RECIBO_COMPRA_PENDIENTE } from "./documentos.ts";

/** El proveedor ya es el de la ficha: sus columnas sobran. */
const sinProveedor = <T extends Entidad>(meta: MetaTabla<T>): MetaTabla<T> =>
  meta.filter((c) => !/proveedor|idfiscal/i.test(String(c.id)));

const porProveedor = (proveedorId: string): ClausulaFiltro[] => [["proveedor_id", "=", proveedorId]];

const metaRecibos = (t = tCompras): MetaTabla<ReciboCompra> => [
  { id: "codigo", cabecera: t("comun.campos.codigo") },
  { id: "fechaEmision", cabecera: t("proveedor.documentos.fechaEmision"), tipo: "fecha" },
  { id: "fechaVencimiento", cabecera: t("proveedor.documentos.fechaVencimiento"), tipo: "fecha" },
  { id: "estado", cabecera: t("comun.campos.estado") },
  { id: "importe", cabecera: t("comun.campos.importe"), tipo: "moneda" },
];

const TarjetaReciboCompra = (recibo: ReciboCompra) => (
  <TarjetaRecibo codigo={recibo.codigo} fecha={recibo.fechaEmision} importe={recibo.importe}
    estado={recibo.estado} divisa={recibo.divisaId} />
);

/** Recibos del proveedor: por defecto sólo los pendientes de pago. */
const RecibosProveedor = ({ proveedorId }: { proveedorId: string }) => {
  const t = useTCompras();
  const meta = useMemo(() => metaRecibos(t), [t]);
  const [soloPendientes, setSoloPendientes] = useState(true);
  const filtro: ClausulaFiltro[] = [
    ...porProveedor(proveedorId),
    ...(soloPendientes
      ? [["estado", "in", ESTADOS_RECIBO_COMPRA_PENDIENTE as unknown as string] as ClausulaFiltro]
      : []),
  ];
  return (
    <DocumentosTercero<ReciboCompra>
      className="RecibosProveedor"
      cargar={getRecibosCompra}
      filtro={filtro}
      orden={ordenDocumentos("fecha_emision")}
      metaTabla={meta}
      tarjeta={TarjetaReciboCompra}
      Detalle={DetalleReciboCompra}
      controles={
        <QCheckbox
          label={t("proveedor.documentos.soloPendientes")}
          nombre="solo_pendientes"
          valor={soloPendientes}
          onChange={(valor) => setSoloPendientes(valor === "true")}
        />
      }
    />
  );
};

/**
 * Documentos del proveedor. Cada subpestaña se monta (y pide sus datos) sólo
 * al pulsarla; el orden es fecha y código descendentes.
 */
export const TabDocumentos = ({ proveedorId }: { proveedorId: string }) => {
  const t = useTCompras();
  const orden = ordenDocumentos();
  const metaPedidos = useMemo(() => sinProveedor(metaTablaPedido(t)), [t]);
  const metaAlbaranes = useMemo(() => sinProveedor(metaTablaAlbaran(t)), [t]);
  const metaFacturas = useMemo(() => sinProveedor(metaTablaFactura(t)), [t]);
  const pestañas = [
    puede("compras.pedido.leer") && (
      <Tab key="tab-pedidos" label={t("proveedor.documentos.pedidos")} children={
        <DocumentosTercero<Pedido> className="PedidosProveedor" cargar={getPedidos}
          filtro={porProveedor(proveedorId)} orden={orden} metaTabla={metaPedidos}
          tarjeta={TarjetaPedido} Detalle={DetallePedido} />
      } />
    ),
    puede("compras.albaran.leer") && (
      <Tab key="tab-albaranes" label={t("proveedor.documentos.albaranes")} children={
        <DocumentosTercero<Albaran> className="AlbaranesProveedor" cargar={getAlbaranes}
          filtro={porProveedor(proveedorId)} orden={orden} metaTabla={metaAlbaranes}
          tarjeta={TarjetaAlbaran} Detalle={DetalleAlbaran} />
      } />
    ),
    puede("compras.factura.leer") && (
      <Tab key="tab-facturas" label={t("proveedor.documentos.facturas")} children={
        <DocumentosTercero<Factura> className="FacturasProveedor" cargar={getFacturas}
          filtro={porProveedor(proveedorId)} orden={orden} metaTabla={metaFacturas}
          tarjeta={TarjetaFactura} Detalle={DetalleFactura} />
      } />
    ),
    puede("tesoreria.recibo_compra") && (
      <Tab key="tab-recibos" label={t("proveedor.documentos.recibos")} children={<RecibosProveedor proveedorId={proveedorId} />} />
    ),
  ];

  return (
    <div className="detalle-proveedor-tab-contenido">
      <Tabs children={pestañas} />
    </div>
  );
};
