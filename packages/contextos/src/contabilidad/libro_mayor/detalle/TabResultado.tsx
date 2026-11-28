import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import {
    LibroMayor,
    LineaLibroMayor,
    ResultadoLibroMayor,
} from "../diseño.ts";
import { nombreFicheroLibroMayor } from "../dominio.ts";
import { getReportLibroMayor } from "../infraestructura.ts";
import { tContabilidad, useTContabilidad } from "../../i18n/index.ts";

const COLUMNAS: MetaTabla<LineaLibroMayor> = [
    { id: "fecha", get cabecera() { return tContabilidad("libro_mayor.fecha"); }, tipo: "fecha" },
    { id: "asientoNumero", get cabecera() { return tContabilidad("libro_mayor.asiento"); }, tipo: "numero" },
    { id: "concepto", get cabecera() { return tContabilidad("libro_mayor.concepto"); } },
    { id: "debe", get cabecera() { return tContabilidad("libro_mayor.debe"); }, tipo: "moneda" },
    { id: "haber", get cabecera() { return tContabilidad("libro_mayor.haber"); }, tipo: "moneda" },
    { id: "saldo", get cabecera() { return tContabilidad("libro_mayor.saldo"); }, tipo: "moneda" },
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
    informe: LibroMayor;
    resultado: ResultadoLibroMayor | null;
    emitir: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { intentar } = useContext(ContextoError);
    const [calculando, setCalculando] = useState(false);
    const [descargando, setDescargando] = useState(false);

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
            const blob = await intentar(() => getReportLibroMayor(informe.id));
            await descargarDocumento(blob, nombreFicheroLibroMayor(informe));
        } finally {
            setDescargando(false);
        }
    }, [descargando, informe, intentar]);

    const ocupado = calculando || descargando;

    return (
        <div className="TabResultado">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={ocupado}>
                    {calculando ? t("libro_mayor.calculando") : t("libro_mayor.calcular")}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={descargar}
                    deshabilitado={ocupado}
                >
                    {t("libro_mayor.descargarPdf")}
                </QBoton>
            </div>

            {!resultado && <p>{t("libro_mayor.pulsaCalcularParaObtenerElMayor")}</p>}

            {resultado && resultado.subcuentas.length === 0 && (
                <p>{t("libro_mayor.noHayMovimientosEnElRango")}</p>
            )}

            {resultado?.subcuentas.map((bloque) => (
                <section
                    key={bloque.cabecera.codigoSubcuenta}
                    className="bloque-subcuenta"
                >
                    <h3>
                        {bloque.cabecera.codigoSubcuenta}{" "}
                        {bloque.cabecera.descripcionSubcuenta}
                    </h3>
                    <p className="saldos-subcuenta">
                        {t("libro_mayor.saldoInicial")}{" "}{importe(bloque.cabecera.saldoInicial)}{" "}{t("libro_mayor.debe2")}{" "}{importe(bloque.totalDebe)}{" "}{t("libro_mayor.haber2")}{" "}
                        {importe(bloque.totalHaber)}{" "}{t("libro_mayor.saldoFinal")}{" "}
                        {importe(bloque.cabecera.saldoFinal)}
                    </p>
                    <QTabla
                        metaTabla={COLUMNAS}
                        datos={bloque.lineas}
                        cargando={calculando}
                        orden={["fecha", "ASC"]}
                        totalEntidades={bloque.total}
                    />
                </section>
            ))}
        </div>
    );
};
