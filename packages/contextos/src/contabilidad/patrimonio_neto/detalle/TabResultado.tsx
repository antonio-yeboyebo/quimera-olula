import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import {
    EstadoPatrimonioNeto,
    FormatoHoja,
    PatrimonioNeto,
} from "../diseño.ts";
import {
    esFilaSaldo,
    importePatrimonioNeto,
    nombreFicheroPatrimonioNeto,
} from "../dominio.ts";
import {
    getHojaPatrimonioNeto,
    getReportPatrimonioNeto,
} from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Pestaña «Datos» de `co_i_patrimonio.ui`: la tabla de 12 filas x 11
 * columnas, con «Recalcular» e «Imprimir resultados». */
export const TabResultado = ({
    informe,
    datos,
    emitir,
}: {
    informe: PatrimonioNeto;
    datos: EstadoPatrimonioNeto | null;
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

    const descargar = useCallback(
        async (extension: "pdf" | FormatoHoja) => {
            if (descargando) return;
            setDescargando(true);
            try {
                const blob = await intentar(() =>
                    extension === "pdf"
                        ? getReportPatrimonioNeto(informe.id)
                        : getHojaPatrimonioNeto(informe.id, extension)
                );
                await descargarDocumento(
                    blob,
                    nombreFicheroPatrimonioNeto(informe, extension)
                );
            } finally {
                setDescargando(false);
            }
        },
        [descargando, informe, intentar]
    );

    const ocupado = calculando || descargando;

    return (
        <div className="TabResultado">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={ocupado}>
                    {calculando ? t("patrimonio_neto.calculando") : t("patrimonio_neto.calcular")}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={() => descargar("pdf")}
                    deshabilitado={ocupado}
                >
                    {t("patrimonio_neto.descargarPdf")}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={() => descargar("xlsx")}
                    deshabilitado={ocupado}
                >
                    {t("patrimonio_neto.descargarExcel")}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={() => descargar("ods")}
                    deshabilitado={ocupado}
                >
                    {t("patrimonio_neto.descargarOds")}
                </QBoton>
            </div>

            {!datos && <p>{t("patrimonio_neto.pulsaCalcularParaObtenerLosImportes")}</p>}

            {datos && (
                <>
                    <h3>{datos.titulo}</h3>
                    <div style={{ overflowX: "auto" }}>
                        <table className="tabla-patrimonio-neto">
                            <thead>
                                <tr>
                                    <th></th>
                                    {datos.columnas.map((c) => (
                                        <th key={c.clave}>{c.descripcion}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {datos.filas.map((fila) => (
                                    <tr
                                        key={fila.clave}
                                        className={
                                            esFilaSaldo(fila)
                                                ? "fila-total"
                                                : "fila-detalle"
                                        }
                                    >
                                        <td
                                            style={{
                                                paddingLeft: `${fila.nivel}rem`,
                                                fontWeight: esFilaSaldo(fila)
                                                    ? "bold"
                                                    : undefined,
                                            }}
                                        >
                                            {fila.descripcion}
                                        </td>
                                        {fila.importes.map((valor, i) => (
                                            <td
                                                key={i}
                                                className="importe"
                                                style={{ textAlign: "right" }}
                                            >
                                                {importePatrimonioNeto(valor)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};
