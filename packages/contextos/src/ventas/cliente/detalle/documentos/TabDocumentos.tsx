import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { DocumentosTercero } from "#/comun/componentes/documentos_tercero/DocumentosTercero.tsx";
import { ordenDocumentos } from "#/comun/componentes/documentos_tercero/dominio.ts";
import { TarjetaRecibo } from "#/comun/componentes/documentos_tercero/TarjetaRecibo.tsx";
import { DetalleReciboVenta } from "#/tesoreria/recibo_venta/detalle/DetalleReciboVenta.tsx";
import { ReciboVenta } from "#/tesoreria/recibo_venta/diseño.ts";
import { ESTADOS_RECIBO_VENTA_DEFECTO } from "#/tesoreria/recibo_venta/dominio.ts";
import { getRecibosVenta } from "#/tesoreria/recibo_venta/infraestructura.ts";
import { metaTablaReciboVenta } from "#/tesoreria/recibo_venta/maestro/metatabla_recibo_venta.tsx";
import { DetalleAlbaran } from "#/ventas/albaran/detalle/DetalleAlbaran.tsx";
import { Albaran } from "#/ventas/albaran/diseño.ts";
import { etiquetaEstadoAlbaran, metaTablaAlbaran } from "#/ventas/albaran/dominio.ts";
import { getAlbaranes } from "#/ventas/albaran/infraestructura.ts";
import { TarjetaDocumentoVenta } from "#/ventas/comun/componentes/TarjetaDocumentoVenta.tsx";
import { DetalleFactura } from "#/ventas/factura/detalle/DetalleFactura.tsx";
import { Factura } from "#/ventas/factura/diseño.ts";
import { etiquetaEstadoFactura, facturaEditable, metaTablaFactura } from "#/ventas/factura/dominio.ts";
import { getFacturas } from "#/ventas/factura/infraestructura.ts";
import { DetallePedido } from "#/ventas/pedido/detalle/DetallePedido.tsx";
import { Pedido } from "#/ventas/pedido/diseño.ts";
import { getPedidos } from "#/ventas/pedido/infraestructura.ts";
import { estadoServidoPedido, etiquetaEstadoPedido } from "#/ventas/pedido/maestro/maestro.ts";
import { getMetaTablaPedido } from "#/ventas/pedido/maestro/metatabla_pedido.tsx";
import { DetallePresupuesto } from "#/ventas/presupuesto/detalle/DetallePresupuesto.tsx";
import { getPresupuestos } from "#/ventas/presupuesto/infraestructura.ts";
import { metaTablaPresupuesto, Presupuesto } from "#/ventas/presupuesto/maestro/diseño.ts";
import { TarjetaMaestroPresupuesto } from "#/ventas/presupuesto/maestro/TarjetaMaestroPresupuesto.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ClausulaFiltro, Criteria, Entidad } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useState } from "react";
import { tVentas, useTVentas } from "../../../i18n/index.ts";


/** El cliente ya es el de la ficha: sus columnas sobran. */
const sinCliente = <T extends Entidad>(meta: MetaTabla<T>): MetaTabla<T> =>
  meta.filter((c) => !/cliente|idfiscal/i.test(String(c.id)));

const porCliente = (clienteId: string): ClausulaFiltro[] => [["cliente_id", "=", clienteId]];

// Los listados de ventas reciben filtro, orden y paginación por separado.
const conCriteria = <T,>(
  get: (f: Criteria["filtro"], o: Criteria["orden"], p: Criteria["paginacion"]) => Promise<{ datos: T[]; total: number }>,
) => (c: Criteria) => get(c.filtro, c.orden, c.paginacion);

const cargarPresupuestos = conCriteria(getPresupuestos);
const cargarPedidos = conCriteria(getPedidos);
const cargarAlbaranes = conCriteria(getAlbaranes);
const cargarFacturas = conCriteria(getFacturas);

// Funciones: las cabeceras salen en el idioma activo al pintar la pestaña.
const metaPresupuestos = () => sinCliente(metaTablaPresupuesto());
const metaPedidos = () => sinCliente(getMetaTablaPedido());
const metaAlbaranes = () => sinCliente([
  {
    id: "estado",
    cabecera: tVentas("documento.maestro.estado"),
    render: (albaran: Albaran) => <EtiquetaEstado {...etiquetaEstadoAlbaran(albaran)} />,
  },
  ...metaTablaAlbaran(),
] as MetaTabla<Albaran>);
const metaFacturas = () => sinCliente([
  {
    id: "estadoExpedicion",
    cabecera: tVentas("documento.maestro.estado"),
    render: (factura: Factura) => <EtiquetaEstado {...etiquetaEstadoFactura(factura)} />,
  },
  ...metaTablaFactura,
] as MetaTabla<Factura>);
// El orden de la lista viene del criteria; las columnas de recibo usan los nombres de la web.
const metaRecibos = sinCliente(metaTablaReciboVenta);

const TarjetaPedido = (pedido: Pedido) => (
  <TarjetaDocumentoVenta
    codigo={pedido.codigo}
    nombreCliente={pedido.cliente.nombre_cliente}
    fecha={pedido.fecha}
    total={pedido.total}
    divisa={pedido.divisa_id}
    tasaConversion={pedido.tasa_conversion}
    totalDivisaEmpresa={pedido.total_divisa_empresa}
    estado={estadoServidoPedido(pedido)}
    etiquetaEstado={etiquetaEstadoPedido(pedido)}
  />
);

const TarjetaAlbaran = (albaran: Albaran) => (
  <TarjetaDocumentoVenta
    codigo={albaran.codigo}
    nombreCliente={albaran.cliente.nombre_cliente}
    fecha={albaran.fecha}
    total={albaran.total}
    divisa={albaran.divisa_id}
    tasaConversion={albaran.tasa_conversion}
    totalDivisaEmpresa={albaran.total_divisa_empresa}
    estado={albaran.facturado ? "cerrado" : "pendiente"}
    etiquetaEstado={etiquetaEstadoAlbaran(albaran)}
  />
);

const TarjetaFactura = (factura: Factura) => (
  <TarjetaDocumentoVenta
    codigo={factura.codigo}
    nombreCliente={factura.cliente.nombre_cliente}
    fecha={factura.fecha}
    total={factura.total}
    divisa={factura.divisa_id}
    tasaConversion={factura.tasa_conversion}
    totalDivisaEmpresa={factura.total_divisa_empresa}
    estado={facturaEditable(factura) ? "pendiente" : "cerrado"}
    etiquetaEstado={etiquetaEstadoFactura(factura)}
  />
);

const TarjetaReciboVenta = (recibo: ReciboVenta) => (
  <TarjetaRecibo codigo={recibo.codigo} fecha={recibo.fechaEmision} importe={recibo.importe}
    estado={recibo.estado} divisa={recibo.divisaId} />
);

/** Recibos del cliente: por defecto sólo los pendientes de cobro (los que no
 * están pagados ni agrupados en otro recibo, como en Tesorería > Recibos). */
const RecibosCliente = ({ clienteId }: { clienteId: string }) => {
  const t = useTVentas();
  const [soloPendientes, setSoloPendientes] = useState(true);
  const filtro: ClausulaFiltro[] = [
    ...porCliente(clienteId),
    ...(soloPendientes
      ? [["estado", "in", ESTADOS_RECIBO_VENTA_DEFECTO as unknown as string] as ClausulaFiltro]
      : []),
  ];
  return (
    <DocumentosTercero<ReciboVenta>
      className="RecibosCliente"
      cargar={getRecibosVenta}
      filtro={filtro}
      orden={ordenDocumentos("fecha_emision")}
      metaTabla={metaRecibos}
      tarjeta={TarjetaReciboVenta}
      Detalle={DetalleReciboVenta}
      controles={
        <QCheckbox
          label={t("cliente.documentos.soloPendientes")}
          nombre="solo_pendientes"
          valor={soloPendientes}
          onChange={(valor) => setSoloPendientes(valor === "true")}
        />
      }
    />
  );
};

/**
 * Documentos del cliente. Cada subpestaña se monta (y pide sus datos) sólo al
 * pulsarla; el orden es fecha y código descendentes.
 */
export const TabDocumentos = ({ clienteId }: { clienteId: string }) => {
  const t = useTVentas();
  const orden = ordenDocumentos();

  const pestañas = [
    puede("ventas.presupuesto.leer") && (
      <Tab key="tab-presupuestos" label={t("cliente.documentos.presupuestos")} children={
        <DocumentosTercero<Presupuesto> className="PresupuestosCliente" cargar={cargarPresupuestos}
          filtro={porCliente(clienteId)} orden={orden} metaTabla={metaPresupuestos()}
          tarjeta={TarjetaMaestroPresupuesto} Detalle={DetallePresupuesto} />
      } />
    ),
    puede("ventas.pedido.leer") && (
      <Tab key="tab-pedidos" label={t("cliente.documentos.pedidos")} children={
        <DocumentosTercero<Pedido> className="PedidosCliente" cargar={cargarPedidos}
          filtro={porCliente(clienteId)} orden={orden} metaTabla={metaPedidos()}
          tarjeta={TarjetaPedido} Detalle={DetallePedido} />
      } />
    ),
    puede("ventas.albaran.leer") && (
      <Tab key="tab-albaranes" label={t("cliente.documentos.albaranes")} children={
        <DocumentosTercero<Albaran> className="AlbaranesCliente" cargar={cargarAlbaranes}
          filtro={porCliente(clienteId)} orden={orden} metaTabla={metaAlbaranes()}
          tarjeta={TarjetaAlbaran} Detalle={DetalleAlbaran} />
      } />
    ),
    puede("ventas.factura.leer") && (
      <Tab key="tab-facturas" label={t("cliente.documentos.facturas")} children={
        <DocumentosTercero<Factura> className="FacturasCliente" cargar={cargarFacturas}
          filtro={porCliente(clienteId)} orden={orden} metaTabla={metaFacturas()}
          tarjeta={TarjetaFactura} Detalle={DetalleFactura} />
      } />
    ),
    puede("tesoreria.recibo_venta") && (
      <Tab key="tab-recibos" label={t("cliente.documentos.recibos")} children={<RecibosCliente clienteId={clienteId} />} />
    ),
  ];

  return (
    <div className="detalle-cliente-tab-contenido">
      <Tabs children={pestañas} />
    </div>
  );
};
