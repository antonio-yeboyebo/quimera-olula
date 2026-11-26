import { urlFicha } from "#/almacen/comun/fichas.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { QTarjetaGenerica } from "@olula/componentes/moleculas/qtarjeta_generica.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, plugin } from "@olula/lib/dominio.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { Link } from "react-router";
import { LecturaLineaOrden, LineaOrdenAlmacen, OrdenAlmacen } from "../../../diseño.ts";
import { deleteLecturaOrden } from "../../../infraestructura.ts";
import { pedidoUnicoDeOrden, sobranteLinea, textoCambioPedido } from "../../../dominio.ts";
import { definicionDeLinea, tieneFaseDrop, tieneFasePick } from "../../../pasos/catalogo.ts";
import { cantidadHecha, cantidadPendiente } from "../../../pasos/lector.ts";
import "./LineasOrdenLista.css";
import { tAlmacen, useTAlmacen } from "../../../../i18n/index.ts";

const formatearFechaHoraLectura = (fechaHora: Date | string): string => {
    const d = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
    return isNaN(d.getTime()) ? String(fechaHora) : d.toLocaleString();
};

const ExpansionLecturas = (orden: OrdenAlmacen, publicar: EmitirEvento) => {
    const Componente = ({ entidad }: { entidad: LineaOrdenAlmacen }) => {
        const t = useTAlmacen();
        const { intentar } = useContext(ContextoError);
        const sgaActivo = plugin("sga") === "activo";
        const lecturas: LecturaLineaOrden[] = entidad.lecturas ?? [];
        if (!lecturas.length) return <p>{t("orden.sinLecturas")}</p>;
        return (
            <table>
                <thead>
                    <tr>
                        <th>{t("orden.lote")}</th>
                        <th>{t("orden.cantidad")}</th>
                        <th>{t("orden.fechaHora")}</th>
                        {sgaActivo && orden.tipo !== "ENTRADA" && <th>{t("orden.ubiOrigen")}</th>}
                        {sgaActivo && orden.tipo !== "ENTRADA" && <th>{t("orden.cajaOrigen3")}</th>}
                        {sgaActivo && orden.tipo !== "SALIDA" && <th>{t("orden.ubiDestino")}</th>}
                        {sgaActivo && orden.tipo !== "SALIDA" && <th>{t("orden.cajaDestino3")}</th>}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {lecturas.map((l) => (
                        <tr key={l.id}>
                            <td>{l.loteId}</td>
                            <td>{l.cantidad}</td>
                            <td>{formatearFechaHoraLectura(l.fechaHora)}</td>
                            {sgaActivo && orden.tipo !== "ENTRADA" && <td>{l.ubicacionOrigen}</td>}
                            {sgaActivo && orden.tipo !== "ENTRADA" && <td>{l.cajaOrigen}</td>}
                            {sgaActivo && orden.tipo !== "SALIDA" && <td>{l.ubicacionDestino}</td>}
                            {sgaActivo && orden.tipo !== "SALIDA" && <td>{l.cajaDestino}</td>}
                            <td>
                                <QBoton
                                    onClick={(e) => {
                                        e?.stopPropagation();
                                        intentar(async () => {
                                            await deleteLecturaOrden(orden.id, l.id);
                                            publicar("lectura_registrada");
                                        });
                                    }}
                                >
                                    {t("orden.borrar")}
                                </QBoton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    return Componente;
};

type PropsLinea = { orden: OrdenAlmacen; linea: LineaOrdenAlmacen };
type TamañoBoton = "pequeño" | "mediano";

const VARIANTE_CAMBIO_PEDIDO = {
    ANADIDA: "primario",
    CAMBIADA: "advertencia",
    BORRADA: "error",
} as const;

/** Marca de las líneas añadidas, cambiadas o borradas en el pedido tras generar la salida. */
const MarcaCambioPedido = ({ linea }: { linea: LineaOrdenAlmacen }) => {
    const texto = textoCambioPedido(linea);
    if (!texto || !linea.cambioPedido) return null;
    return <QEtiqueta variante={VARIANTE_CAMBIO_PEDIDO[linea.cambioPedido]}>{texto}</QEtiqueta>;
};

/** Enlace al pedido de venta del que procede la línea. */
const PedidoLinea = ({ linea }: { linea: LineaOrdenAlmacen }) => {
    if (!linea.pedidoVentaId) return null;
    return (
        <Link
            to={urlFicha.pedidoVenta(linea.pedidoVentaId) ?? ""}
            onClick={(e) => e.stopPropagation()}
            title={linea.cliente ?? undefined}
        >
            {linea.pedidoVenta ?? linea.pedidoVentaId}
        </Link>
    );
};

const varianteProgreso = (hecho: number, prevista: number) =>
    hecho === 0 ? "error" : hecho < prevista ? "advertencia" : "exito";

const CantidadLinea = ({ orden, linea }: PropsLinea) => {
    const prevista = linea.cantidadPrevista;
    const conPick = !!definicionDeLinea(linea, orden, "PICK");
    const conDrop = tieneFaseDrop(linea, orden);
    if (conPick && conDrop) {
        const pick = cantidadHecha(linea, orden, "PICK");
        const drop = cantidadHecha(linea, orden, "DROP");
        return (
            <span style={{ display: "flex", gap: "4px" }}>
                <QEtiqueta variante={varianteProgreso(pick, prevista)}>{tAlmacen("orden.pPickPrevista", { pick, prevista })}</QEtiqueta>
                <QEtiqueta variante={varianteProgreso(drop, prevista)}>{tAlmacen("orden.dDropPrevista", { drop, prevista })}</QEtiqueta>
            </span>
        );
    }
    const hecho = cantidadHecha(linea, orden, conPick ? "PICK" : "DROP");
    return <QEtiqueta variante={varianteProgreso(hecho, prevista)}>{hecho} / {prevista}</QEtiqueta>;
};

const BotonPick = ({ orden, linea, publicar, tamaño }: PropsLinea & { publicar: EmitirEvento; tamaño?: TamañoBoton }) => {
    if (!definicionDeLinea(linea, orden, "PICK")) return null;
    return (
        <QBoton
            tamaño={tamaño}
            deshabilitado={cantidadPendiente(linea, orden, "PICK") <= 0}
            onClick={(e) => {
                e?.stopPropagation();
                publicar("lectura_guion_pick_linea_solicitada", linea);
            }}
        >
            {tAlmacen("orden.leerPick")}
        </QBoton>
    );
};

const BotonDrop = ({ orden, linea, publicar, tamaño }: PropsLinea & { publicar: EmitirEvento; tamaño?: TamañoBoton }) => {
    if (!tieneFaseDrop(linea, orden)) return null;
    // Con fase de pick, solo se puede dejar lo que ya se ha recogido.
    const hayRecogido = !tieneFasePick(linea, orden) || (linea.cantidadPick ?? 0) > 0;
    return (
        <QBoton
            tamaño={tamaño}
            deshabilitado={!hayRecogido || cantidadPendiente(linea, orden, "DROP") <= 0}
            onClick={(e) => {
                e?.stopPropagation();
                publicar("lectura_guion_drop_linea_solicitada", linea);
            }}
        >
            {tAlmacen("orden.leerDrop")}
        </QBoton>
    );
};

/** Material recogido de más porque el pedido se redujo o se quitó la línea en ventas. */
const AvisoSobrante = ({ linea, publicar, tamaño }: { linea: LineaOrdenAlmacen; publicar: EmitirEvento; tamaño?: TamañoBoton }) => {
    const sobrante = sobranteLinea(linea);
    if (sobrante <= 0) return null;
    return (
        <>
            <QEtiqueta variante="advertencia">
                {tAlmacen("orden.sobranteSobrante", { sobrante })}
            </QEtiqueta>
            <QBoton
                tamaño={tamaño}
                onClick={(e) => {
                    e?.stopPropagation();
                    publicar("devolucion_sobrante_solicitada", linea);
                }}
            >
                {tAlmacen("orden.devolver")}
            </QBoton>
        </>
    );
};

const tarjetaLineaOrden = (orden: OrdenAlmacen, publicar: EmitirEvento) => {
    const Lecturas = ExpansionLecturas(orden, publicar);
    // Con un solo pedido, el pedido va en la cabecera de la orden y la línea solo lleva la marca.
    const variosPedidos = orden.tipo === "SALIDA" && !pedidoUnicoDeOrden(orden);
    const TarjetaLineaOrden = (linea: LineaOrdenAlmacen) => {
        const sgaActivo = plugin("sga") === "activo";
        const ubicaciones = [
            sgaActivo && orden.tipo !== "ENTRADA" && linea.ubicacionOrigen ? tAlmacen("orden.deUbicacionorigen", { ubicacionOrigen: linea.ubicacionOrigen }) : null,
            sgaActivo && orden.tipo !== "SALIDA" && linea.ubicacionDestino ? `A ${linea.ubicacionDestino}` : null,
        ].filter(Boolean).join(" · ");
        const mostrarPedido = variosPedidos && !!linea.pedidoVentaId;
        const mostrarMarca = orden.tipo === "SALIDA" && !!linea.cambioPedido;
        const detalles = [ubicaciones, linea.loteId ? tAlmacen("orden.loteLoteid", { loteId: linea.loteId }) : null].filter(Boolean).join(" · ");
        return (
            <QTarjetaGenerica
                key={linea.id}
                arribaIzquierda={
                    <div className="TarjetaLineaOrden__articulo">
                        <strong>{linea.sku} · {linea.articulo}</strong>
                        {(detalles || mostrarPedido || mostrarMarca) && (
                            <span className="TarjetaLineaOrden__info">
                                {mostrarPedido && (
                                    <span>
                                        {tAlmacen("orden.pedido")}{" "}<PedidoLinea linea={linea} />
                                        {linea.cliente ? ` · ${linea.cliente}` : ""}
                                    </span>
                                )}
                                {mostrarMarca && <MarcaCambioPedido linea={linea} />}
                                {detalles && <span>{detalles}</span>}
                            </span>
                        )}
                    </div>
                }
                arribaDerecha={
                    <div className="TarjetaLineaOrden__derecha">
                        <CantidadLinea orden={orden} linea={linea} />
                        {/* Arriba, lejos del "Ver más" del pie, para no pulsar uno por otro. */}
                        <AvisoSobrante linea={linea} publicar={publicar} tamaño="pequeño" />
                        <BotonPick orden={orden} linea={linea} publicar={publicar} tamaño="pequeño" />
                        <BotonDrop orden={orden} linea={linea} publicar={publicar} tamaño="pequeño" />
                    </div>
                }
                expansion={<Lecturas entidad={linea} />}
            />
        );
    };
    return TarjetaLineaOrden;
};

/** En salidas, la columna Pedido solo aporta si hay líneas de distintos pedidos o alguna con aviso. */
const conColumnaPedido = (orden: OrdenAlmacen): boolean => {
    if (orden.tipo !== "SALIDA") return false;
    const pedidos = new Set(orden.lineas.map((l) => l.pedidoVentaId).filter(Boolean));
    return pedidos.size > 1 || orden.lineas.some((l) => !!textoCambioPedido(l));
};

const metaTablaLineasOrden = (orden: OrdenAlmacen, publicar: EmitirEvento): MetaTabla<LineaOrdenAlmacen> => {
    const sgaActivo = plugin("sga") === "activo";
    return {
        cols: [
            { id: "sku", cabecera: "SKU", enlace: (l: LineaOrdenAlmacen) => urlFicha.articulo(l.sku) },
            { id: "articulo", cabecera: tAlmacen("orden.descripcion"), tipo: "texto" },
            { id: "loteId", cabecera: tAlmacen("orden.lote") },
            ...(conColumnaPedido(orden)
                ? [
                    {
                        id: "pedidoVenta" as const,
                        cabecera: tAlmacen("orden.pedido"),
                        render: (linea: LineaOrdenAlmacen) => (
                            <span style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
                                <PedidoLinea linea={linea} />
                                <MarcaCambioPedido linea={linea} />
                            </span>
                        ),
                    },
                ]
                : []),
            {
                id: "cantidadPrevista" as const,
                cabecera: tAlmacen("orden.cantidad"),
                tipo: 'numero' as const,
                render: (linea: LineaOrdenAlmacen) => <CantidadLinea orden={orden} linea={linea} />,
            },
            ...(sgaActivo && orden.tipo !== "ENTRADA" ? [{
                id: "ubicacionOrigen" as const, cabecera: "Ubi.Origen",
                enlace: (l: LineaOrdenAlmacen) => urlFicha.ubicacion(l.idUbicacionOrigen),
            }] : []),
            ...(sgaActivo && orden.tipo !== "ENTRADA" ? [{
                id: "cajaOrigen" as const, cabecera: tAlmacen("orden.lpnOrigen"),
                enlace: (l: LineaOrdenAlmacen) => urlFicha.caja(l.idCajaOrigen),
            }] : []),
            ...(sgaActivo && orden.tipo !== "SALIDA" ? [{
                id: "ubicacionDestino" as const, cabecera: "Ubi.Destino",
                enlace: (l: LineaOrdenAlmacen) => urlFicha.ubicacion(l.idUbicacionDestino),
            }] : []),
            ...(sgaActivo && orden.tipo !== "SALIDA" ? [{
                id: "cajaDestino" as const, cabecera: tAlmacen("orden.lpnDestino"),
                enlace: (l: LineaOrdenAlmacen) => urlFicha.caja(l.idCajaDestino),
            }] : []),
            {
                id: "acciones_sobrante",
                cabecera: "",
                render: (linea: LineaOrdenAlmacen) => <AvisoSobrante linea={linea} publicar={publicar} />,
            },
            {
                id: "acciones_pick",
                cabecera: "",
                render: (linea: LineaOrdenAlmacen) => <BotonPick orden={orden} linea={linea} publicar={publicar} />,
            },
            {
                id: "acciones_drop",
                cabecera: "",
                render: (linea: LineaOrdenAlmacen) => <BotonDrop orden={orden} linea={linea} publicar={publicar} />,
            },
        ],
        expansion: ExpansionLecturas(orden, publicar),
    };
};

export const LineasOrdenLista = ({
    orden,
    lineas,
    seleccionada,
    publicar,
}: {
    orden: OrdenAlmacen;
    lineas: LineaOrdenAlmacen[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => {
    const setSeleccionada = (linea: LineaOrdenAlmacen) => {
        publicar("linea_seleccionada", linea);
    };

    return (
        <ListadoSemiControlado
            metaTabla={metaTablaLineasOrden(orden, publicar)}
            entidades={lineas}
            totalEntidades={lineas.length}
            cargando={false}
            seleccionada={lineas.find((l) => l.id === seleccionada) ?? null}
            onSeleccion={setSeleccionada}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            tarjeta={tarjetaLineaOrden(orden, publicar)}
        />
    );
};
