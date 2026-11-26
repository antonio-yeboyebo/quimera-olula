import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import {
    FilaLibroDiario,
    LibroDiario,
    LineaLibroDiario,
    ResultadoLibroDiario,
} from "../diseño.ts";
import {
    CABECERAS_IVA_LIBRO_DIARIO,
    CABECERAS_LIBRO_DIARIO,
    celdasFilaLibroDiario,
    nombreFicheroLibroDiario,
    textoCabeceraLibroDiario,
} from "../dominio.ts";
import { getReportLibroDiario } from "../infraestructura.ts";
import "./TabResultado.css";
import { tContabilidad, useTContabilidad } from "../../i18n/index.ts";

/** Resultado agrupado por el servidor: (mes,) asiento y debajo sus partidas. */
const TablaAgrupada = ({
    filas,
    datosIva,
}: {
    filas: FilaLibroDiario[];
    datosIva: boolean;
}) => {
    const cabeceras = datosIva
        ? [...CABECERAS_LIBRO_DIARIO, ...CABECERAS_IVA_LIBRO_DIARIO]
        : [...CABECERAS_LIBRO_DIARIO];

    return (
        <table className="tabla-libro-diario">
            <thead>
                <tr>
                    {cabeceras.map((cabecera) => (
                        <th key={cabecera}>{textoCabeceraLibroDiario(cabecera)}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filas.map((fila, indice) => (
                    <tr key={indice} className={`fila-${fila.tipo}`}>
                        {celdasFilaLibroDiario(fila, datosIva).map(
                            (celda, columna) => (
                                <td
                                    key={columna}
                                    colSpan={
                                        celda.columnas > 1
                                            ? celda.columnas
                                            : undefined
                                    }
                                    className={
                                        celda.numerica ? "importe" : undefined
                                    }
                                >
                                    {celda.texto}
                                </td>
                            )
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const COLUMNAS_BASE: MetaTabla<LineaLibroDiario> = [
    { id: "fecha", get cabecera() { return tContabilidad("libro_diario.fecha"); }, tipo: "fecha" },
    { id: "asientoNumero", get cabecera() { return tContabilidad("libro_diario.asiento"); }, tipo: "numero" },
    { id: "conceptoAsiento", get cabecera() { return tContabilidad("libro_diario.conceptoAsiento"); } },
    { id: "codigoSubcuenta", get cabecera() { return tContabilidad("libro_diario.subcuenta"); } },
    { id: "concepto", get cabecera() { return tContabilidad("libro_diario.conceptoPartida"); } },
    { id: "debe", get cabecera() { return tContabilidad("libro_diario.debe"); }, tipo: "moneda" },
    { id: "haber", get cabecera() { return tContabilidad("libro_diario.haber"); }, tipo: "moneda" },
];

const COLUMNAS_IVA: MetaTabla<LineaLibroDiario> = [
    { id: "baseImponible", get cabecera() { return tContabilidad("libro_diario.base"); }, tipo: "moneda" },
    { id: "codigoSerie", get cabecera() { return tContabilidad("libro_diario.serie"); } },
    { id: "factura", get cabecera() { return tContabilidad("libro_diario.factura"); }, tipo: "numero" },
    { id: "iva", get cabecera() { return tContabilidad("libro_diario.iva"); }, tipo: "numero" },
    { id: "recargo", get cabecera() { return tContabilidad("libro_diario.rE"); }, tipo: "numero" },
];

const importe = (valor: number): string =>
    valor.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export const TabResultado = ({
    informe,
    resultado,
    emitir,
}: {
    informe: LibroDiario;
    resultado: ResultadoLibroDiario | null;
    emitir: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { intentar } = useContext(ContextoError);
    const [calculando, setCalculando] = useState(false);
    const [descargando, setDescargando] = useState(false);

    const metaTabla = useMemo(
        () =>
            informe.datosIva
                ? [...COLUMNAS_BASE, ...COLUMNAS_IVA]
                : COLUMNAS_BASE,
        [informe.datosIva]
    );

    const calcular = useCallback(async () => {
        if (calculando) return;
        setCalculando(true);
        try {
            await emitir("calculo_solicitado");
        } finally {
            setCalculando(false);
        }
    }, [calculando, emitir]);

    const descargar = useCallback(async () => {
        if (descargando) return;
        setDescargando(true);
        try {
            const blob = await intentar(() => getReportLibroDiario(informe.id));
            await descargarDocumento(blob, nombreFicheroLibroDiario(informe));
        } finally {
            setDescargando(false);
        }
    }, [descargando, informe, intentar]);

    const ocupado = calculando || descargando;

    return (
        <div className="TabResultado">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={ocupado}>
                    {calculando ? t("libro_diario.calculando") : t("libro_diario.calcular")}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={descargar}
                    deshabilitado={ocupado}
                >
                    {t("libro_diario.descargarPdf")}
                </QBoton>
            </div>

            {!resultado && <p>{t("libro_diario.pulsaCalcularParaObtenerElLibro")}</p>}

            {resultado && informe.resumenMensual && (
                <div className="resumen-mensual">
                    {resultado.resumenMensual.map((periodo) => (
                        <table key={periodo.indice} className="tabla-periodo">
                            <caption>{periodo.titulo}</caption>
                            <thead>
                                <tr>
                                    <th>{t("libro_diario.subcuenta")}</th>
                                    <th>{t("libro_diario.descripcion")}</th>
                                    <th>{t("libro_diario.debe")}</th>
                                    <th>{t("libro_diario.haber")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periodo.lineas.map((linea) => (
                                    <tr key={linea.codigoSubcuenta}>
                                        <td>{linea.codigoSubcuenta}</td>
                                        <td>{linea.descripcionSubcuenta}</td>
                                        <td className="importe">
                                            {importe(linea.debe)}
                                        </td>
                                        <td className="importe">
                                            {importe(linea.haber)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2}>{t("libro_diario.totalPeriodo")}</td>
                                    <td className="importe">
                                        {importe(periodo.totalDebe)}
                                    </td>
                                    <td className="importe">
                                        {importe(periodo.totalHaber)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>{t("libro_diario.acumuladoDiario")}</td>
                                    <td className="importe">
                                        {importe(periodo.acumuladoDebe)}
                                    </td>
                                    <td className="importe">
                                        {importe(periodo.acumuladoHaber)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    ))}
                </div>
            )}

            {resultado && !informe.resumenMensual && resultado.filas && (
                <TablaAgrupada
                    filas={resultado.filas}
                    datosIva={informe.datosIva}
                />
            )}

            {resultado && !informe.resumenMensual && !resultado.filas && (
                <>
                    <QTabla
                        metaTabla={metaTabla}
                        datos={resultado.datos}
                        cargando={calculando}
                        orden={["fecha", "ASC"]}
                        totalEntidades={resultado.total}
                    />

                    {resultado.totalesMes.length > 0 && (
                        <table className="tabla-totales-mes">
                            <thead>
                                <tr>
                                    <th>{t("libro_diario.mes")}</th>
                                    <th>{t("libro_diario.debe")}</th>
                                    <th>{t("libro_diario.haber")}</th>
                                    <th>{t("libro_diario.descuadre")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultado.totalesMes.map((mes) => (
                                    <tr key={mes.mes}>
                                        <td>{mes.mes}</td>
                                        <td className="importe">
                                            {importe(mes.debe)}
                                        </td>
                                        <td className="importe">
                                            {importe(mes.haber)}
                                        </td>
                                        <td className="importe">
                                            {importe(mes.descuadre)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {resultado.totales && (
                        <p className="totales-diario">
                            {t("libro_diario.totalesDebeValorHaberValor2Descuadre", { valor: importe(resultado.totales.debe), valor2: importe(resultado.totales.haber), valor3: importe(resultado.totales.descuadre) })}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};
