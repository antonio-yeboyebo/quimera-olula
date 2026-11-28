import { ComponenteDashboard, ConsultaComponente, TipoComponente } from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

/**
 * Dashboards por defecto: la Inicio y uno por módulo. Viven en código (no en la base
 * de datos): el usuario ve el de por defecto hasta que guarda su versión (`clave`).
 * Cada consulta se valida en el servidor al guardar; los tests lo comprueban con las
 * mismas reglas de forma.
 *
 * Alturas en medias filas (`ALTO_FILA_DASHBOARD`): tarjeta h=2 (88 px, como los widgets del maestro).
 */
export type DashboardPorDefecto = {
  nombre: string;
  componentes: ComponenteDashboard[];
};

const PENDIENTES_SERVIR = [{ campo: "servido", operador: "in", valor: ["No", "Parcial"] }];
const PENDIENTES_RECIBIR = [{ campo: "recibido", operador: "in", valor: ["No", "Parcial"] }];
const RECIBOS_PENDIENTES = [
  { campo: "estado_recibo", operador: "in", valor: ["Emitido", "Devuelto"] },
];

const EMPRESAS_ACTIVAS = [{ campo: "estado", operador: "=", valor: "activo" }];
const EMPRESAS_INACTIVAS = [{ campo: "estado", operador: "in", valor: ["suspendido", "baja"] }];
const FACTURAS_PAGADAS = [{ campo: "estado", operador: "=", valor: "pagada" }];

const componente = (
  id: string,
  tipo: TipoComponente,
  titulo: string,
  [x, y, w, h]: [number, number, number, number],
  consulta: ConsultaComponente
): ComponenteDashboard => ({ id, tipo, titulo, x, y, w, h, consultas: [consulta], opciones: {} });

/** Importes que el nombre de la medida no delata (`mrr`): se fija el formato. */
const enMoneda = (c: ComponenteDashboard): ComponenteDashboard => ({
  ...c,
  opciones: { ...c.opciones, formato: "moneda" },
});

const facturadoMes = (recurso: string, titulo: string, x: number) =>
  componente("facturado_mes", "tarjeta", titulo, [x, 0, 3, 2], {
    recurso,
    metricas: "suma:total",
    periodo: "fecha:este_mes",
    comparar: "año_anterior",
  });

const evolucionMensual = (recurso: string, titulo: string, medida = "total", fecha = "fecha") =>
  componente("evolucion", "temporal", titulo, [0, 2, 8, 8], {
    recurso,
    metricas: `suma:${medida}`,
    agrupar: `${fecha}:mes`,
    periodo: `${fecha}:ultimos_12_meses`,
    comparar: "año_anterior",
    limite: 100,
  });

const mapaVentas = (y: number) =>
  componente("mapa_ventas", "mapa", tComun("dashboard.ventasYClientesDelAnoPor"), [0, y, 12, 12], {
    recurso: "ventas.factura",
    metricas: "suma:total,conteo_distinto:cliente",
    agrupar: "provincia",
    periodo: "fecha:este_año",
    limite: 100,
  });

const recibosPendientes = (recurso: string, titulo: string, x: number) =>
  componente(`${recurso.split(".")[1]}_pendientes`, "tarjeta", titulo, [x, 0, 3, 2], {
    recurso,
    metricas: "suma:importe",
    filtros: RECIBOS_PENDIENTES,
  });

export const DASHBOARDS_POR_DEFECTO: Record<string, DashboardPorDefecto> = {
  inicio: {
    get nombre() { return tComun("dashboard.inicio"); },
    get componentes(): ComponenteDashboard[] { return [
      facturadoMes("ventas.factura", tComun("dashboard.facturadoEsteMes"), 0),
      componente("pedidos_pendientes", "tarjeta", tComun("dashboard.pedidosPendientesDeServir"), [3, 0, 3, 2], {
        recurso: "ventas.pedido",
        metricas: "conteo",
        filtros: PENDIENTES_SERVIR,
      }),
      recibosPendientes("tesoreria.recibo_cobro", tComun("dashboard.cobrosPendientes"), 6),
      recibosPendientes("tesoreria.recibo_pago", tComun("dashboard.pagosPendientes"), 9),
      evolucionMensual("ventas.factura", tComun("dashboard.facturacionMensual")),
      componente("pedidos_estado", "circular", tComun("dashboard.pedidosDelAnoPorEstado"), [8, 2, 4, 8], {
        recurso: "ventas.pedido",
        metricas: "conteo",
        agrupar: "servido",
        periodo: "fecha:este_año",
        limite: 10,
      }),
      componente("top_clientes", "ranking", tComun("dashboard.mejoresClientesDelAno"), [0, 10, 6, 8], {
        recurso: "ventas.factura",
        metricas: "suma:total",
        agrupar: "cliente",
        periodo: "fecha:este_año",
        limite: 8,
      }),
      componente("cobros_antiguos", "tabla", tComun("dashboard.cobrosPendientesMasAntiguos"), [6, 10, 6, 8], {
        recurso: "tesoreria.recibo_cobro",
        columnas: "recibo,nombre_cliente,fecha_vencimiento,importe",
        filtros: RECIBOS_PENDIENTES,
        orden: "fecha_vencimiento:asc",
        limite: 8,
      }),
      mapaVentas(18),
    ]; },
  },

  ventas: {
    get nombre() { return tComun("dashboard.ventas"); },
    get componentes(): ComponenteDashboard[] { return [
      facturadoMes("ventas.factura", tComun("dashboard.facturadoEsteMes"), 0),
      componente("ticket_medio", "tarjeta", tComun("dashboard.facturaMediaDelAno"), [3, 0, 3, 2], {
        recurso: "ventas.factura",
        metricas: "promedio:total",
        periodo: "fecha:este_año",
        comparar: "año_anterior",
      }),
      componente("presupuestos_mes", "tarjeta", tComun("dashboard.presupuestosEsteMes"), [6, 0, 3, 2], {
        recurso: "ventas.presupuesto",
        metricas: "conteo",
        periodo: "fecha:este_mes",
        comparar: "año_anterior",
      }),
      componente("pedidos_pendientes", "tarjeta", tComun("dashboard.pedidosPendientesDeServir"), [9, 0, 3, 2], {
        recurso: "ventas.pedido",
        metricas: "conteo",
        filtros: PENDIENTES_SERVIR,
      }),
      evolucionMensual("ventas.factura", tComun("dashboard.facturacionMensual")),
      componente("por_agente", "circular", tComun("dashboard.facturadoPorAgenteEsteAno"), [8, 2, 4, 8], {
        recurso: "ventas.factura",
        metricas: "suma:total",
        agrupar: "agente",
        periodo: "fecha:este_año",
        limite: 20,
      }),
      componente("top_articulos", "ranking", tComun("dashboard.articulosMasVendidosDelAno"), [0, 10, 6, 8], {
        recurso: "ventas.factura.linea",
        metricas: "suma:importe",
        agrupar: "articulo",
        periodo: "fecha:este_año",
        limite: 8,
      }),
      componente("pedidos_por_servir", "tabla", tComun("dashboard.pedidosPendientesDeServir"), [6, 10, 6, 8], {
        recurso: "ventas.pedido",
        columnas: "pedido,nombre_cliente,fecha,total",
        filtros: PENDIENTES_SERVIR,
        orden: "fecha:asc",
        limite: 8,
      }),
      mapaVentas(18),
    ]; },
  },

  compras: {
    get nombre() { return tComun("dashboard.compras"); },
    get componentes(): ComponenteDashboard[] { return [
      facturadoMes("compras.factura", tComun("dashboard.comprasEsteMes"), 0),
      componente("pedidos_pendientes", "tarjeta", tComun("dashboard.pedidosPendientesDeRecibir"), [3, 0, 3, 2], {
        recurso: "compras.pedido",
        metricas: "conteo",
        filtros: PENDIENTES_RECIBIR,
      }),
      recibosPendientes("tesoreria.recibo_pago", tComun("dashboard.pagosPendientes"), 6),
      componente("albaranes_sin_facturar", "tarjeta", tComun("dashboard.albaranesSinFacturar"), [9, 0, 3, 2], {
        recurso: "compras.albaran",
        metricas: "suma:total",
        filtros: [{ campo: "facturado", operador: "=", valor: false }],
      }),
      evolucionMensual("compras.factura", tComun("dashboard.comprasPorMes")),
      {
        ...componente("ciclo_compra", "embudo", tComun("dashboard.cicloDeCompraDelAno"), [8, 2, 4, 8], {
          recurso: "compras.pedido",
          metricas: "suma:total",
          periodo: "fecha:este_año",
        }),
        consultas: ["compras.pedido", "compras.albaran", "compras.factura"].map((recurso) => ({
          recurso,
          metricas: "suma:total",
          periodo: "fecha:este_año",
        })),
        opciones: { circuito: "compras", formato: "moneda" },
      },
      componente("top_proveedores", "ranking", tComun("dashboard.principalesProveedoresDelAno"), [0, 10, 6, 8], {
        recurso: "compras.factura",
        metricas: "suma:total",
        agrupar: "proveedor",
        periodo: "fecha:este_año",
        limite: 8,
      }),
      componente("pagos_antiguos", "tabla", tComun("dashboard.pagosPendientesMasAntiguos"), [6, 10, 6, 8], {
        recurso: "tesoreria.recibo_pago",
        columnas: "recibo,nombre_proveedor,fecha_vencimiento,importe",
        filtros: RECIBOS_PENDIENTES,
        orden: "fecha_vencimiento:asc",
        limite: 8,
      }),
    ]; },
  },

  almacen: {
    get nombre() { return tComun("dashboard.almacen"); },
    get componentes(): ComponenteDashboard[] { return [
      componente("unidades", "tarjeta", tComun("dashboard.unidadesEnStock"), [0, 0, 3, 2], {
        recurso: "almacen.stock",
        metricas: "suma:cantidad",
      }),
      componente("reservadas", "tarjeta", tComun("dashboard.unidadesReservadas"), [3, 0, 3, 2], {
        recurso: "almacen.stock",
        metricas: "suma:reservada",
      }),
      componente("pendientes", "tarjeta", tComun("dashboard.pendientesDeRecibir"), [6, 0, 3, 2], {
        recurso: "almacen.stock",
        metricas: "suma:pendiente_recibir",
      }),
      componente("sin_disponible", "tarjeta", tComun("dashboard.articulosSinDisponible"), [9, 0, 3, 2], {
        recurso: "almacen.stock",
        metricas: "conteo",
        filtros: [{ campo: "disponible", operador: "<=", valor: 0 }],
      }),
      componente("por_almacen", "barras", tComun("dashboard.stockPorAlmacen"), [0, 2, 6, 8], {
        recurso: "almacen.stock",
        metricas: "suma:cantidad",
        agrupar: "almacen",
        limite: 20,
      }),
      componente("por_familia", "ranking", tComun("dashboard.stockPorFamilia"), [6, 2, 6, 8], {
        recurso: "almacen.stock",
        metricas: "suma:cantidad",
        agrupar: "familia",
        limite: 10,
      }),
      componente("agotados", "tabla", tComun("dashboard.articulosSinDisponible"), [0, 10, 12, 8], {
        recurso: "almacen.stock",
        columnas: "articulo,descripcion_articulo,almacen,disponible,pendiente_recibir",
        filtros: [{ campo: "disponible", operador: "<=", valor: 0 }],
        orden: "disponible:asc",
        limite: 10,
      }),
    ]; },
  },

  tesoreria: {
    get nombre() { return tComun("dashboard.tesoreria"); },
    get componentes(): ComponenteDashboard[] { return [
      recibosPendientes("tesoreria.recibo_cobro", tComun("dashboard.cobrosPendientes"), 0),
      recibosPendientes("tesoreria.recibo_pago", tComun("dashboard.pagosPendientes"), 3),
      componente("cobrado_mes", "tarjeta", tComun("dashboard.cobradoEsteMes"), [6, 0, 3, 2], {
        recurso: "tesoreria.recibo_cobro",
        metricas: "suma:importe",
        periodo: "fecha_pago:este_mes",
        comparar: "año_anterior",
      }),
      componente("pagado_mes", "tarjeta", tComun("dashboard.pagadoEsteMes"), [9, 0, 3, 2], {
        recurso: "tesoreria.recibo_pago",
        metricas: "suma:importe",
        periodo: "fecha_pago:este_mes",
        comparar: "año_anterior",
      }),
      evolucionMensual("tesoreria.recibo_cobro", tComun("dashboard.cobrosPorMes"), "importe", "fecha_pago"),
      componente("cobros_estado", "circular", tComun("dashboard.recibosDeCobroPorEstado"), [8, 2, 4, 8], {
        recurso: "tesoreria.recibo_cobro",
        metricas: "suma:importe",
        agrupar: "estado_recibo",
        periodo: "fecha_emision:este_año",
        limite: 10,
      }),
      componente("cobros_antiguos", "tabla", tComun("dashboard.cobrosPendientesMasAntiguos"), [0, 10, 6, 8], {
        recurso: "tesoreria.recibo_cobro",
        columnas: "recibo,nombre_cliente,fecha_vencimiento,importe",
        filtros: RECIBOS_PENDIENTES,
        orden: "fecha_vencimiento:asc",
        limite: 8,
      }),
      componente("pagos_antiguos", "tabla", tComun("dashboard.pagosPendientesMasAntiguos"), [6, 10, 6, 8], {
        recurso: "tesoreria.recibo_pago",
        columnas: "recibo,nombre_proveedor,fecha_vencimiento,importe",
        filtros: RECIBOS_PENDIENTES,
        orden: "fecha_vencimiento:asc",
        limite: 8,
      }),
    ]; },
  },

  crm: {
    nombre: "CRM",
    get componentes(): ComponenteDashboard[] { return [
      componente("oportunidades", "tarjeta", tComun("dashboard.oportunidades"), [0, 0, 3, 2], {
        recurso: "crm.oportunidad_venta",
        metricas: "conteo",
      }),
      componente("importe_oportunidades", "tarjeta", tComun("dashboard.importeEnOportunidades"), [3, 0, 3, 2], {
        recurso: "crm.oportunidad_venta",
        metricas: "suma:total_venta",
      }),
      componente("leads", "tarjeta", tComun("dashboard.leads"), [6, 0, 3, 2], {
        recurso: "crm.lead",
        metricas: "conteo",
      }),
      componente("incidencias", "tarjeta", tComun("dashboard.incidenciasEsteMes"), [9, 0, 3, 2], {
        recurso: "crm.incidencia",
        metricas: "conteo",
        periodo: "fecha:este_mes",
        comparar: "periodo_anterior",
      }),
      componente("oportunidades_estado", "circular", tComun("dashboard.oportunidadesPorEstado"), [0, 2, 4, 8], {
        recurso: "crm.oportunidad_venta",
        metricas: "suma:total_venta",
        agrupar: "estado",
        limite: 10,
      }),
      componente("leads_estado", "barras", tComun("dashboard.leadsPorEstado"), [4, 2, 4, 8], {
        recurso: "crm.lead",
        metricas: "conteo",
        agrupar: "estado",
        limite: 10,
      }),
      componente("incidencias_prioridad", "barras", tComun("dashboard.incidenciasPorPrioridad"), [8, 2, 4, 8], {
        recurso: "crm.incidencia",
        metricas: "conteo",
        agrupar: "prioridad",
        limite: 10,
      }),
      componente("acciones_mes", "temporal", tComun("dashboard.accionesComercialesPorMes"), [0, 10, 12, 8], {
        recurso: "crm.accion",
        metricas: "conteo",
        agrupar: "fecha:mes",
        periodo: "fecha:ultimos_12_meses",
        comparar: "año_anterior",
        limite: 100,
      }),
    ]; },
  },
  // Backoffice del SaaS (olula_saas_admin): recursos saas.* sobre la BD central.
  saas: {
    get nombre() { return tComun("dashboard.resumenDelSaas"); },
    get componentes(): ComponenteDashboard[] { return [
      componente("empresas_activas", "tarjeta", tComun("dashboard.empresasActivas"), [0, 0, 3, 2], {
        recurso: "saas.empresa",
        metricas: "conteo",
        filtros: EMPRESAS_ACTIVAS,
      }),
      componente("empresas_inactivas", "tarjeta", tComun("dashboard.empresasInactivas"), [3, 0, 3, 2], {
        recurso: "saas.empresa",
        metricas: "conteo",
        filtros: EMPRESAS_INACTIVAS,
      }),
      enMoneda(
        componente("mrr", "tarjeta", tComun("dashboard.ingresoMensualRecurrenteMrr"), [6, 0, 3, 2], {
          recurso: "saas.empresa",
          metricas: "suma:mrr",
        })
      ),
      enMoneda(
        componente("facturado_total", "tarjeta", tComun("dashboard.totalFacturado"), [9, 0, 3, 2], {
          recurso: "saas.factura",
          metricas: "suma:total",
          filtros: FACTURAS_PAGADAS,
        })
      ),
      componente("en_prueba", "tarjeta", tComun("dashboard.empresasEnPrueba"), [0, 2, 3, 2], {
        recurso: "saas.empresa",
        metricas: "conteo",
        filtros: [{ campo: "estado_suscripcion", operador: "=", valor: "prueba" }],
      }),
      componente("de_pago", "tarjeta", tComun("dashboard.empresasDePago"), [3, 2, 3, 2], {
        recurso: "saas.empresa",
        metricas: "suma:de_pago",
      }),
      enMoneda(
        componente("cobrado_mes", "tarjeta", tComun("dashboard.cobradoEsteMes"), [6, 2, 3, 2], {
          recurso: "saas.factura",
          metricas: "suma:total",
          filtros: FACTURAS_PAGADAS,
          periodo: "fecha:este_mes",
          comparar: "periodo_anterior",
        })
      ),
      enMoneda(
        componente("pendiente_cobro", "tarjeta", tComun("dashboard.pendienteDeCobro"), [9, 2, 3, 2], {
          recurso: "saas.factura",
          metricas: "suma:total",
          filtros: [{ campo: "estado", operador: "in", valor: ["pendiente", "fallida", "devuelta"] }],
        })
      ),
      enMoneda(
        componente("facturacion_mensual", "temporal", tComun("dashboard.facturacionMensual"), [0, 4, 8, 8], {
          recurso: "saas.factura",
          metricas: "suma:total",
          filtros: FACTURAS_PAGADAS,
          agrupar: "fecha:mes",
          periodo: "fecha:ultimos_12_meses",
          comparar: "año_anterior",
          limite: 100,
        })
      ),
      componente("empresas_estado", "circular", tComun("dashboard.empresasPorEstado"), [8, 4, 4, 8], {
        recurso: "saas.empresa",
        metricas: "conteo",
        agrupar: "estado",
        limite: 10,
      }),
      componente("altas_mes", "temporal", tComun("dashboard.altasDeEmpresasPorMes"), [0, 12, 8, 8], {
        recurso: "saas.empresa",
        metricas: "conteo",
        agrupar: "fecha_alta:mes",
        periodo: "fecha_alta:ultimos_12_meses",
        limite: 100,
      }),
      componente("suscripciones_estado", "circular", tComun("dashboard.suscripcionesPorEstado"), [8, 12, 4, 8], {
        recurso: "saas.empresa",
        metricas: "conteo",
        agrupar: "estado_suscripcion",
        limite: 10,
      }),
      enMoneda(
        componente("mrr_plan", "ranking", tComun("dashboard.ingresoMensualPorPlan"), [0, 20, 4, 8], {
          recurso: "saas.empresa",
          metricas: "suma:mrr",
          agrupar: "plan",
          limite: 10,
        })
      ),
      componente("pruebas", "tabla", tComun("dashboard.pruebasQueTerminanAntes"), [4, 20, 4, 8], {
        recurso: "saas.empresa",
        columnas: "nombre,nombre_plan,fin_prueba,mrr_prueba",
        filtros: [{ campo: "estado_suscripcion", operador: "=", valor: "prueba" }],
        orden: "fin_prueba:asc",
        limite: 8,
      }),
      componente("impagos", "tabla", tComun("dashboard.impagos"), [8, 20, 4, 8], {
        recurso: "saas.empresa",
        columnas: "nombre,nombre_plan,impagada_desde,mrr",
        filtros: [{ campo: "estado_suscripcion", operador: "in", valor: ["impagada", "solo_lectura"] }],
        orden: "impagada_desde:asc",
        limite: 8,
      }),
      enMoneda(
        componente("top_empresas", "ranking", tComun("dashboard.empresasQueMasHanPagado"), [0, 28, 4, 8], {
          recurso: "saas.factura",
          metricas: "suma:total",
          filtros: FACTURAS_PAGADAS,
          agrupar: "empresa",
          limite: 8,
        })
      ),
      componente("consumo_mes", "barras", tComun("dashboard.consumoDelMes"), [4, 28, 4, 8], {
        recurso: "saas.consumo",
        metricas: "suma:cantidad",
        agrupar: "limite",
        periodo: "mes:este_mes",
        limite: 10,
      }),
      componente("ultimas_altas", "tabla", tComun("dashboard.ultimasAltas"), [8, 28, 4, 8], {
        recurso: "saas.empresa",
        columnas: "nombre,fecha_alta,nombre_plan,estado",
        orden: "fecha_alta:desc",
        limite: 8,
      }),
    ]; },
  },
};

export const CLAVES_MODULO = ["ventas", "compras", "almacen", "tesoreria", "crm"] as const;
