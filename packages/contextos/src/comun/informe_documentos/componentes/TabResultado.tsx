import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import { FichaInforme, ModoInforme, PestañaInforme, ResultadoInforme } from "../diseño.ts";
import { MODOS_POR_DEFECTO, nombreFicheroInforme } from "../dominio.ts";
import { getReportInforme } from "../infraestructura.ts";
import { TablaResultado } from "./TablaResultado.tsx";
import { useTComun } from "../../i18n/index.ts";

/** Un botón por modo de la pestaña («Calcular detalle», «Calcular resumen»…)
 * y «Descargar PDF» (el PDF de lo último que se ha calculado: los documentos
 * uno tras otro o el resumen). */
export const TabResultado = ({
    pestaña,
    ficha,
    resultado,
    modo,
    emitir,
}: {
    pestaña: PestañaInforme;
    ficha: FichaInforme;
    resultado: ResultadoInforme | null;
    modo: ModoInforme | null;
    emitir: EmitirEvento;
}) => {
    const t = useTComun();
    const { intentar } = useContext(ContextoError);
    const [ocupado, setOcupado] = useState<ModoInforme | "pdf" | null>(null);

    const calcular = useCallback(
        async (modoCalculo: ModoInforme) => {
            if (ocupado) return;
            setOcupado(modoCalculo);
            try {
                await emitir("calculo_solicitado", modoCalculo);
            } finally {
                setOcupado(null);
            }
        },
        [ocupado, emitir]
    );

    const descargar = useCallback(async () => {
        if (ocupado || !modo) return;
        setOcupado("pdf");
        try {
            const blob = await intentar(() => getReportInforme(pestaña, ficha.id, modo));
            await descargarDocumento(blob, nombreFicheroInforme(pestaña, ficha, modo));
        } finally {
            setOcupado(null);
        }
    }, [ocupado, modo, intentar, pestaña, ficha]);

    return (
        <div className="TabResultadoInforme">
            <div className="maestro-botones">
                {(pestaña.modos ?? MODOS_POR_DEFECTO).map(({ modo: modoCalculo, etiqueta }) => (
                    <QBoton key={modoCalculo} onClick={() => calcular(modoCalculo)} deshabilitado={!!ocupado}>
                        {ocupado === modoCalculo ? t("informeDocumentos.calculando") : etiqueta}
                    </QBoton>
                ))}
                <QBoton variante="borde" onClick={descargar} deshabilitado={!!ocupado || !modo}>
                    {t("informeDocumentos.descargarPdf")}
                </QBoton>
            </div>

            {!resultado && (
                <p>{t("informeDocumentos.pulsaUnBotonCalcularDescargarPdf")}</p>
            )}

            {resultado && (
                <>
                    <h3>
                        {resultado.titulo} · {resultado.totalDocumentos}{" "}
                        {resultado.totalDocumentos === 1 ? "fila" : "filas"}
                    </h3>
                    <TablaResultado resultado={resultado} />
                </>
            )}
        </div>
    );
};
