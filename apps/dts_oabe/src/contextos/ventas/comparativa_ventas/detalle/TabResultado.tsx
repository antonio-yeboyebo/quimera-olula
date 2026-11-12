import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { ComparativaVentas, ResultadoComparativaVentas } from "../diseño.ts";
import { nombreFicheroComparativaVentas } from "../dominio.ts";
import { getReportComparativaVentas } from "../infraestructura.ts";

type FilaTabla = Entidad & Record<string, string | number | null>;

const columnas = (resultado: ResultadoComparativaVentas): MetaTabla<FilaTabla> => [
    { id: "clienteId", cabecera: "Código" },
    { id: "nombre", cabecera: "Nombre" },
    ...resultado.anios.flatMap((anio, i) => [
        { id: `ventas${i}`, cabecera: String(anio), tipo: "moneda" as const },
        { id: `incremento${i}`, cabecera: "% Inc.", tipo: "numero" as const },
    ]),
    ...(resultado.mostrarObjetivo
        ? [
              { id: "objetivo", cabecera: "Objetivo", tipo: "moneda" as const },
              { id: "porcentajeObjetivo", cabecera: "% Obj.", tipo: "numero" as const },
          ]
        : []),
];

const filas = (resultado: ResultadoComparativaVentas): FilaTabla[] => [
    ...resultado.filas.map((fila) => ({
        id: fila.clienteId,
        clienteId: fila.clienteId,
        nombre: fila.nombre,
        ...Object.fromEntries(
            fila.ventas.flatMap((ventas, i) => [
                [`ventas${i}`, ventas],
                [`incremento${i}`, Math.round(fila.incrementos[i] * 100) / 100],
            ])
        ),
        objetivo: fila.objetivo,
        porcentajeObjetivo:
            fila.porcentajeObjetivo === null
                ? null
                : Math.round(fila.porcentajeObjetivo * 100) / 100,
    })),
    {
        id: "__totales",
        clienteId: "",
        nombre: "Totales",
        ...Object.fromEntries(
            resultado.totales.flatMap((total, i) => [
                [`ventas${i}`, total],
                [`incremento${i}`, null],
            ])
        ),
        objetivo: resultado.totalObjetivo,
        porcentajeObjetivo: null,
    },
];

export const TabResultado = ({
    comparativa,
    resultado,
    emitir,
}: {
    comparativa: ComparativaVentas;
    resultado: ResultadoComparativaVentas | null;
    emitir: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [calculando, setCalculando] = useState(false);
    const [descargando, setDescargando] = useState(false);

    const metaTabla = useMemo(() => (resultado ? columnas(resultado) : []), [resultado]);
    const datos = useMemo(() => (resultado ? filas(resultado) : []), [resultado]);

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
            const blob = await intentar(() => getReportComparativaVentas(comparativa.id));
            await descargarDocumento(blob, nombreFicheroComparativaVentas(comparativa));
        } finally {
            setDescargando(false);
        }
    }, [descargando, comparativa, intentar]);

    const ocupado = calculando || descargando;

    return (
        <div className="TabResultado">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={ocupado}>
                    {calculando ? "Calculando…" : "Calcular"}
                </QBoton>
                <QBoton variante="borde" onClick={descargar} deshabilitado={ocupado}>
                    Descargar PDF
                </QBoton>
            </div>

            {!resultado && <p>Pulsa «Calcular» para obtener la comparativa.</p>}

            {resultado && (
                <QTabla
                    metaTabla={metaTabla}
                    datos={datos}
                    cargando={calculando}
                    orden={["clienteId", "ASC"]}
                    totalEntidades={datos.length}
                />
            )}
        </div>
    );
};
