import { FilaLibroIva, ResultadoLibroIva } from "#/contabilidad/comun/librosIva.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { LibroFacturasEmitidas } from "../diseño.ts";
import { nombreFicheroLibroFacturasEmitidas } from "../dominio.ts";
import { getReportLibroFacturasEmitidas } from "../infraestructura.ts";
import { tContabilidad, useTContabilidad } from "../../i18n/index.ts";

/** Las columnas replican las del `.kut`, incluidas las que las opciones de
 * la ficha pueden quitar. */
const columnas = (
    informe: LibroFacturasEmitidas
): MetaTabla<FilaLibroIva> => [
    { id: "codigoFactura", cabecera: tContabilidad("libro_facturas_emitidas.factura") },
    { id: "fechaAsiento", cabecera: tContabilidad("libro_facturas_emitidas.fechaAs"), tipo: "fecha" },
    ...(informe.mostrarAsiento
        ? ([{ id: "asientoNumero", cabecera: tContabilidad("libro_facturas_emitidas.as"), tipo: "numero" }] as const)
        : []),
    ...(informe.mostrarDocumento
        ? ([{ id: "documento", cabecera: tContabilidad("libro_facturas_emitidas.documento") }] as const)
        : []),
    ...(informe.mostrarNif
        ? ([{ id: "cifNif", cabecera: tContabilidad("libro_facturas_emitidas.cifNif") }] as const)
        : []),
    { id: "nombreTercero", cabecera: tContabilidad("libro_facturas_emitidas.tercero") },
    { id: "baseImponible", cabecera: tContabilidad("libro_facturas_emitidas.base"), tipo: "moneda" },
    { id: "cuotaIva", cabecera: tContabilidad("libro_facturas_emitidas.cuotaIva"), tipo: "moneda" },
    { id: "porcentajeIva", cabecera: tContabilidad("libro_facturas_emitidas.iva"), tipo: "numero" },
];

export const TabResultado = ({
    informe,
    resultado,
    emitir,
}: {
    informe: LibroFacturasEmitidas;
    resultado: ResultadoLibroIva | null;
    emitir: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { intentar } = useContext(ContextoError);
    const [calculando, setCalculando] = useState(false);
    const [descargando, setDescargando] = useState(false);

    const metaTabla = useMemo(() => columnas(informe), [informe]);

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
            const blob = await intentar(() =>
                getReportLibroFacturasEmitidas(informe.id)
            );
            await descargarDocumento(
                blob,
                nombreFicheroLibroFacturasEmitidas(informe)
            );
        } finally {
            setDescargando(false);
        }
    }, [descargando, informe, intentar]);

    const ocupado = calculando || descargando;

    return (
        <div className="TabResultado">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={ocupado}>
                    {calculando ? t("libro_facturas_emitidas.calculando") : t("libro_facturas_emitidas.calcular")}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={descargar}
                    deshabilitado={ocupado}
                >
                    {t("libro_facturas_emitidas.descargarPdf")}
                </QBoton>
            </div>

            {!resultado && <p>{t("libro_facturas_emitidas.pulsaCalcularParaObtenerElLibro")}</p>}

            {resultado && (
                <QTabla
                    metaTabla={metaTabla}
                    datos={resultado.datos}
                    cargando={calculando}
                    orden={["fechaAsiento", "ASC"]}
                    totalEntidades={resultado.total}
                />
            )}
        </div>
    );
};
