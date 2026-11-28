import { FilaLibroIva, ResultadoLibroIva } from "#/contabilidad/comun/librosIva.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { LibroFacturasRecibidas } from "../diseño.ts";
import { nombreFicheroLibroFacturasRecibidas } from "../dominio.ts";
import { getReportLibroFacturasRecibidas } from "../infraestructura.ts";
import { tContabilidad, useTContabilidad } from "../../i18n/index.ts";

/** Las columnas replican las del `.kut`, incluidas las que las opciones de
 * la ficha pueden quitar. */
const columnas = (
    informe: LibroFacturasRecibidas
): MetaTabla<FilaLibroIva> => [
    { id: "codigoFactura", cabecera: tContabilidad("libro_facturas_recibidas.factura") },
    { id: "fechaAsiento", cabecera: tContabilidad("libro_facturas_recibidas.fechaAs"), tipo: "fecha" },
    ...(informe.mostrarAsiento
        ? ([{ id: "asientoNumero", cabecera: tContabilidad("libro_facturas_recibidas.as"), tipo: "numero" }] as const)
        : []),
    ...(informe.mostrarDocumento
        ? ([{ id: "documento", cabecera: tContabilidad("libro_facturas_recibidas.documento") }] as const)
        : []),
    ...(informe.mostrarNif
        ? ([{ id: "cifNif", cabecera: tContabilidad("libro_facturas_recibidas.cifNif") }] as const)
        : []),
    { id: "nombreTercero", cabecera: tContabilidad("libro_facturas_recibidas.tercero") },
    { id: "baseImponible", cabecera: tContabilidad("libro_facturas_recibidas.base"), tipo: "moneda" },
    { id: "cuotaIva", cabecera: tContabilidad("libro_facturas_recibidas.cuotaIva"), tipo: "moneda" },
    { id: "porcentajeIva", cabecera: tContabilidad("libro_facturas_recibidas.iva"), tipo: "numero" },
];

export const TabResultado = ({
    informe,
    resultado,
    emitir,
}: {
    informe: LibroFacturasRecibidas;
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
                getReportLibroFacturasRecibidas(informe.id)
            );
            await descargarDocumento(
                blob,
                nombreFicheroLibroFacturasRecibidas(informe)
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
                    {calculando ? t("libro_facturas_recibidas.calculando") : t("libro_facturas_recibidas.calcular")}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={descargar}
                    deshabilitado={ocupado}
                >
                    {t("libro_facturas_recibidas.descargarPdf")}
                </QBoton>
            </div>

            {!resultado && <p>{t("libro_facturas_recibidas.pulsaCalcularParaObtenerElLibro")}</p>}

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
