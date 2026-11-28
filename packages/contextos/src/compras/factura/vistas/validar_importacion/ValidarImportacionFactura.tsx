import { Articulo } from "#/compras/comun/componentes/articulo.tsx";
import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { formatearFechaString } from "@olula/lib/dominio.ts";
import { useCallback, useEffect, useMemo } from "react";
import { CrearArticuloImportacion } from "../crear_articulo_importacion/CrearArticuloImportacion.tsx";
import {
    ContextoValidarImportacion,
    FacturaLeida,
    FicheroOriginal,
    LineaFacturaLeida,
    LineaPropuesta,
    PropuestaImportacion,
} from "./diseño.ts";
import {
    alternarAlbaran,
    cambiarLinea,
    estadoTotal,
    etiquetaAlerta,
    etiquetaAlertaLinea,
    formatearCantidad,
    formatearImporte,
    formatearPrecio,
    hayTotalDiscordante,
    motivosNoConfirmable,
    porcentaje,
    resumenImportacion,
    textoAlbaranLinea,
} from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { ResumenImportacion } from "./ResumenImportacion.tsx";
import { VisorFichero } from "./VisorFichero.tsx";
import "./ValidarImportacionFactura.css";
import { useTCompras } from "#/compras/i18n/index.ts";

type Props = {
    facturaLeida: FacturaLeida;
    propuestaInicial?: PropuestaImportacion;
    fichero?: FicheroOriginal | null;
    cargandoFichero?: boolean;
    onConfirmar: (facturaLeida: FacturaLeida) => Promise<void>;
    onCancelar: () => void;
};

export const ValidarImportacionFactura = ({
    facturaLeida,
    propuestaInicial,
    fichero = null,
    cargandoFichero = false,
    onConfirmar,
    onCancelar,
}: Props) => {
    const t = useTCompras();
    const contextoInicial = useMemo<ContextoValidarImportacion>(
        () => ({
            estado: propuestaInicial ? "EDITANDO" : "CARGANDO_PROPUESTA",
            facturaLeida: propuestaInicial
                ? {
                      ...propuestaInicial.facturaLeida,
                      proveedorNombre:
                          propuestaInicial.facturaLeida.proveedorNombre ??
                          facturaLeida.proveedorNombre,
                  }
                : facturaLeida,
            propuesta: propuestaInicial ?? null,
            sucia: false,
            lineaArticulo: null,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial);

    useEffect(() => {
        if (ctx.estado === "CARGANDO_PROPUESTA") {
            emitir("propuesta_solicitada").catch(() => onCancelar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { estado, facturaLeida: leida, propuesta } = ctx;

    const aceptar = useCallback(
        async () => onConfirmar(leida),
        [onConfirmar, leida]
    );

    const motivos = motivosNoConfirmable(leida, propuesta);
    const lineaArticulo =
        ctx.lineaArticulo !== null ? leida.lineas[ctx.lineaArticulo] : undefined;

    return (
        <QModal
            abierto={true}
            nombre="validarImportacionFactura"
            titulo={t("factura.importacion.titulo")}
            onCerrar={onCancelar}
            pantallaCompleta
        >
            <div className="ValidarImportacionFactura">
                <div className="panel-datos">
                    <div className="datos">
                        {!propuesta && <div>{t("factura.importacion.calculando")}</div>}

                        {propuesta && (
                            <>
                                <Cabecera
                                    leida={leida}
                                    propuesta={propuesta}
                                    emitir={emitir}
                                />
                                <LineasImportacion
                                    leida={leida}
                                    propuesta={propuesta}
                                    emitir={emitir}
                                />
                                <AlbaranesPendientes
                                    leida={leida}
                                    propuesta={propuesta}
                                    emitir={emitir}
                                />

                                {motivos.length > 0 && (
                                    <ul className="motivos">
                                        {motivos.map((m) => (
                                            <li key={m}>{m}</li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>

                    <div className="botones">
                        <QBoton onClick={onCancelar} variante="texto">
                            {t("comun.botones.cancelar")}
                        </QBoton>
                        <QBoton
                            onClick={() => emitir("confirmar_solicitado")}
                            deshabilitado={estado !== "EDITANDO" || motivos.length > 0}
                        >
                            {t("factura.importacion.confirmar")}
                        </QBoton>
                    </div>

                    {estado === "CREANDO_ARTICULO" && propuesta && lineaArticulo && (
                        <CrearArticuloImportacion
                            linea={lineaArticulo}
                            proveedorId={leida.proveedorId ?? ""}
                            modoDatosContables={propuesta.modoDatosContables}
                            opcionesDatosContables={propuesta.opcionesDatosContables}
                            publicar={emitir}
                        />
                    )}

                    {estado === "CONFIRMANDO" && propuesta && (
                        <QModalConfirmacion
                            nombre="confirmarImportacionFactura"
                            abierto={true}
                            titulo={t("factura.importacion.importarTitulo")}
                            mensaje={t("factura.importacion.importarMensaje")}
                            labelAceptar={t("factura.importacion.importar")}
                            onCerrar={() => emitir("confirmacion_cancelada")}
                            onAceptar={aceptar}
                        >
                            <ResumenImportacion
                                resumen={resumenImportacion(leida, propuesta)}
                            />
                        </QModalConfirmacion>
                    )}
                </div>
                <VisorFichero fichero={fichero} cargando={cargandoFichero} />
            </div>
        </QModal>
    );
};

type Emitir = (evento: string, payload?: unknown) => Promise<void>;

const Cabecera = ({
    leida,
    propuesta,
    emitir,
}: {
    leida: FacturaLeida;
    propuesta: PropuestaImportacion;
    emitir: Emitir;
}) => {
    const t = useTCompras();
    const discordante = hayTotalDiscordante(propuesta);

    return (
        <div className="cabecera">
            <quimera-formulario>
                <Proveedor
                    nombre="proveedorImportacion"
                    valor={leida.proveedorId ?? ""}
                    descripcion={leida.proveedorNombre ?? ""}
                    onChange={(op) =>
                        emitir("leida_cambiada", {
                            ...leida,
                            proveedorId: op?.valor ?? null,
                            proveedorNombre: op?.descripcion ?? null,
                            albaranIds: undefined,
                        })
                    }
                />
                <QInput
                    label={t("comun.documento.numeroFacturaProveedor")}
                    nombre="numeroProveedor"
                    valor={leida.numeroProveedor ?? ""}
                    onChange={(v) =>
                        emitir("leida_ajustada", { ...leida, numeroProveedor: v })
                    }
                />
                <QInput
                    label={t("comun.campos.fecha")}
                    nombre="fecha"
                    tipo="fecha"
                    valor={leida.fecha ?? ""}
                    onChange={(v) => emitir("leida_ajustada", { ...leida, fecha: v })}
                />
            </quimera-formulario>

            <div className="totales">
                <span>{t("factura.importacion.totalLeido")}: <strong>{formatearImporte(propuesta.totalLeido)}</strong></span>
                <TotalComparado
                    etiqueta={t("factura.importacion.totalCalculado")}
                    valor={propuesta.totalCalculado}
                    leido={propuesta.totalLeido}
                />
                {/* Sin precio teórico en todas las líneas no hay total teórico. */}
                {propuesta.totalTeorico !== null && (
                    <TotalComparado
                        etiqueta={t("factura.importacion.totalTeorico")}
                        valor={propuesta.totalTeorico}
                        leido={propuesta.totalLeido}
                    />
                )}
            </div>

            {propuesta.alertas.map((a) => (
                <div className="aviso" key={a}>
                    {etiquetaAlerta(a)}
                </div>
            ))}

            {discordante && (
                <QCheckbox
                    label={t("factura.importacion.aceptarDiferencia")}
                    nombre="aceptarTotalDiscordante"
                    valor={leida.aceptarTotalDiscordante === true}
                    onChange={(v) =>
                        emitir("leida_ajustada", {
                            ...leida,
                            aceptarTotalDiscordante: v === "true",
                        })
                    }
                />
            )}
        </div>
    );
};

const LineasImportacion = ({
    leida,
    propuesta,
    emitir,
}: {
    leida: FacturaLeida;
    propuesta: PropuestaImportacion;
    emitir: Emitir;
}) => {
    const t = useTCompras();
    const editar = (indice: number, cambios: Partial<LineaFacturaLeida>) =>
        emitir("leida_editada", cambiarLinea(leida, indice, cambios));

    const reproponer = () => emitir("repropuesta_solicitada");

    const hayCuentaEspecial = propuesta.lineas.some(
        (l) => l.subcuenta?.origen === "cuenta_especial"
    );
    const cuentaEspecial = propuesta.cuentaEspecialCompras;

    return (
        <div className="lineas">
            <h4>{t("comun.documento.pestanas.lineas")}</h4>
            {hayCuentaEspecial && (
                <div className="aviso">
                    {t("factura.importacion.cuentaEspecial", {
                        cuenta: cuentaEspecial
                            ? ` (${cuentaEspecial.codigo} - ${cuentaEspecial.descripcion})`
                            : "",
                    })}
                </div>
            )}
            <table className="tabla-lineas">
                <colgroup>
                    <col className="col-articulo" />
                    <col className="col-datos" />
                </colgroup>
                {propuesta.lineas.map((pl) => {
                        const l = leida.lineas[pl.indice];
                        if (!l) return null;
                        return (
                            <FilaLinea
                                key={pl.indice}
                                pl={pl}
                                l={l}
                                propuesta={propuesta}
                                editar={editar}
                                reproponer={reproponer}
                                emitir={emitir}
                                leida={leida}
                            />
                        );
                    })}
            </table>
        </div>
    );
};

const FilaLinea = ({
    pl,
    l,
    leida,
    propuesta,
    editar,
    reproponer,
    emitir,
}: {
    pl: LineaPropuesta;
    l: LineaFacturaLeida;
    leida: FacturaLeida;
    propuesta: PropuestaImportacion;
    editar: (indice: number, cambios: Partial<LineaFacturaLeida>) => Promise<void>;
    reproponer: () => Promise<void>;
    emitir: Emitir;
}) => {
    const t = useTCompras();
    const i = pl.indice;
    const sc = pl.subcuenta;
    // Sin coste de proveedor el teórico es un cero sin significado: no se muestra.
    const conTeoricos = !pl.alertas.includes("sin_coste_proveedor");
    // Lo leído que no coincide con el coste del proveedor se marca erróneo.
    const precioErroneo = conTeoricos && pl.alertas.includes("precio_distinto");
    const dtoErroneo = conTeoricos && pl.alertas.includes("dto_distinto");

    // Una tbody por línea, en dos columnas: a la izquierda artículo y
    // descripción; a la derecha el resto de datos y, debajo, las cantidades.
    return (
        <tbody className="linea-importacion">
            <tr className="fila-superior">
                <td>
                    <div className="articulo-linea">
                        <Articulo
                            nombre={`articulo_${i}`}
                            label={t("comun.campos.articulo")}
                            valor={l.articuloId ?? ""}
                            onChange={(op) =>
                                emitir(
                                    "leida_cambiada",
                                    cambiarLinea(leida, i, {
                                        articuloId: op?.valor ?? null,
                                        albaranLineaId: null,
                                    })
                                )
                            }
                        />
                        {pl.alertas.includes("sin_articulo") && (
                            <QBoton
                                tamaño="pequeño"
                                onClick={() => emitir("crear_articulo_solicitado", i)}
                            >
                                {t("factura.importacion.crearArticulo")}
                            </QBoton>
                        )}
                    </div>
                </td>
                <td>
                    <div className="datos-linea">
                        <Dato etiqueta={t("factura.importacion.grupoIva")} valor={pl.grupoIvaProductoId ?? "—"} />
                        <div className={`dato subcuenta${sc?.origen === "cuenta_especial" ? " destacado" : ""}`}>
                            <span className="etiqueta">{t("factura.importacion.subcuentaGasto")}</span>
                            <span className="valor">
                                {sc ? (
                                    <>
                                        {sc.origen === "cuenta_especial" && "⚠ "}
                                        {sc.codigo} {sc.descripcion}
                                        <small> ({t(`factura.importacion.origenes.${sc.origen}`)})</small>
                                    </>
                                ) : (
                                    "—"
                                )}
                            </span>
                        </div>
                        <Dato
                            etiqueta={t("factura.importacion.lineaAlbaran")}
                            valor={textoAlbaranLinea(propuesta.albaranes, pl.albaranLineaId) || "—"}
                        />
                        {pl.alertas.length > 0 && (
                            <div className="alertas-linea">
                                {pl.alertas.map((a) => (
                                    <span className="insignia" key={a}>
                                        {etiquetaAlertaLinea(a)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </td>
            </tr>
            <tr className="fila-inferior">
                <td>
                    <QInput
                        label={t("comun.campos.descripcion")}
                        nombre={`descripcion_${i}`}
                        valor={l.descripcion ?? ""}
                        onChange={(v) => editar(i, { descripcion: v })}
                        onBlur={reproponer}
                    />
                </td>
                <td>
                    <div className="importes-linea">
                        <QInput
                            label={t("comun.lineas.cantidad")}
                            nombre={`cantidad_${i}`}
                            tipo="decimal"
                            decimales={2}
                            valor={l.cantidad ?? ""}
                            onChange={(v) => editar(i, { cantidad: v })}
                            onBlur={reproponer}
                        />
                        <QInput
                            label={t("factura.importacion.precioLeido")}
                            nombre={`precio_${i}`}
                            tipo="decimal"
                            decimales={4}
                            erroneo={precioErroneo}
                            valor={l.precioUnitario ?? ""}
                            onChange={(v) => editar(i, { precioUnitario: v })}
                            onBlur={reproponer}
                        />
                        <QInput
                            label={t("factura.importacion.dtoLeido")}
                            nombre={`dto_leido_${i}`}
                            tipo="decimal"
                            decimales={2}
                            valor={aTexto(pl.dtoLeido)}
                            soloLectura
                            erroneo={dtoErroneo}
                        />
                        <QInput
                            label={t("factura.importacion.totalLeido")}
                            nombre={`total_leido_${i}`}
                            tipo="moneda"
                            valor={aTexto(pl.totalLeido)}
                            soloLectura
                        />
                        {conTeoricos && (
                            <QInput
                                label={t("factura.importacion.precioTeorico")}
                                nombre={`precio_teorico_${i}`}
                                tipo="decimal"
                                decimales={4}
                                valor={aTexto(pl.precioTeorico)}
                                soloLectura
                            />
                        )}
                        {conTeoricos && (
                            <QInput
                                label={t("factura.importacion.dtoTeorico")}
                                nombre={`dto_teorico_${i}`}
                                tipo="decimal"
                                decimales={2}
                                valor={aTexto(pl.dtoTeorico)}
                                soloLectura
                            />
                        )}
                    </div>
                </td>
            </tr>
        </tbody>
    );
};

/** Un total frente al leído: verde con ✓ si cuadra, rojo con ✗ si no. */
const TotalComparado = ({
    etiqueta,
    valor,
    leido,
}: {
    etiqueta: string;
    valor: number | null;
    leido: number | null;
}) => {
    const t = useTCompras();
    const estado = estadoTotal(leido, valor);
    return (
        <span className={estado ? `total-${estado}` : ""}>
            {etiqueta}: <strong>{formatearImporte(valor)}</strong>
            {estado === "ok" && <span className="icono-total" title={t("factura.importacion.cuadra")}> ✓</span>}
            {estado === "error" && <span className="icono-total" title={t("factura.importacion.noCuadra")}> ✗</span>}
        </span>
    );
};

const aTexto = (valor: number | null): string =>
    valor === null ? "" : String(valor);

const Dato = ({
    etiqueta,
    valor,
    destacado = false,
}: {
    etiqueta: string;
    valor: string;
    destacado?: boolean;
}) => (
    <div className={`dato${destacado ? " destacado" : ""}`}>
        <span className="etiqueta">{etiqueta}</span>
        <span className="valor">{valor}</span>
    </div>
);

const AlbaranesPendientes = ({
    leida,
    propuesta,
    emitir,
}: {
    leida: FacturaLeida;
    propuesta: PropuestaImportacion;
    emitir: Emitir;
}) => {
    const t = useTCompras();
    if (propuesta.albaranes.length === 0) return null;

    return (
        <div className="albaranes">
            <h4>{t("factura.importacion.albaranesPendientes")}</h4>
            {propuesta.albaranes.map((a) => (
                <details key={a.id}>
                    <summary className="albaran-resumen">
                        <QCheckbox
                            label={a.codigo}
                            nombre={`albaran_${a.id}`}
                            valor={a.seleccionado}
                            deshabilitado={!a.coincide}
                            onChange={(v) =>
                                emitir("leida_cambiada", {
                                    ...leida,
                                    albaranIds: alternarAlbaran(
                                        propuesta.albaranes,
                                        a.id,
                                        v === "true"
                                    ),
                                })
                            }
                        />
                        <QInput
                            label={t("comun.campos.fecha")}
                            nombre={`albaran_fecha_${a.id}`}
                            tipo="fecha"
                            valor={formatearFechaString(a.fecha)}
                            soloLectura
                        />
                        <QInput
                            label={t("comun.campos.total")}
                            nombre={`albaran_total_${a.id}`}
                            tipo="moneda"
                            valor={aTexto(a.total)}
                            soloLectura
                        />
                        <span>{t("factura.importacion.cobertura", { porcentaje: porcentaje(a.cobertura) })}</span>
                        {!a.coincide && <span className="insignia">{t("factura.importacion.noCoincide")}</span>}
                    </summary>
                    <ul>
                        {a.lineas.map((al) => (
                            <li key={al.id}>
                                {al.descripcion} · {formatearCantidad(al.cantidad)} ×{" "}
                                {formatearPrecio(al.precio)}
                                {al.lineaFactura !== null &&
                                    t("factura.importacion.aLinea", { linea: al.lineaFactura + 1 })}
                            </li>
                        ))}
                    </ul>
                </details>
            ))}
        </div>
    );
};
