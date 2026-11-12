import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { nivelAfinidad, porcentajeAfinidad, textoNivelAfinidad } from "../dominio.ts";

type EtiquetaAfinidadProps = {
    score: number;
    conPorcentaje?: boolean;
};

const variantes = {
    muy_alta: "exito",
    alta: "exito",
    media: "advertencia",
} as const;

export const EtiquetaAfinidad = ({ score, conPorcentaje = false }: EtiquetaAfinidadProps) => {
    const nivel = nivelAfinidad(score);
    if (!nivel) return null;

    return (
        <QEtiqueta variante={variantes[nivel]}>
            {textoNivelAfinidad[nivel]}
            {conPorcentaje && ` · ${porcentajeAfinidad(score)} %`}
        </QEtiqueta>
    );
};
