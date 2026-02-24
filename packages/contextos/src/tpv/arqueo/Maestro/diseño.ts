import { MetaTabla } from "@olula/componentes/index.js";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { CabeceraArqueoTpv } from "../diseño.ts";

export type EstadoMaestroArqueosTpv = (
    'INICIAL'
);

// export type ContextoMaestroArqueosTpv = {
//     estado: EstadoMaestroArqueosTpv;
//     arqueos: ArqueoTpv[];
//     totalArqueos: number;
//     arqueoActivo: ArqueoTpv | null;
// };

export type ContextoMaestroArqueosTpv = {
    estado: EstadoMaestroArqueosTpv;
    arqueos: ListaEntidades<CabeceraArqueoTpv>
};

export const metaTablaArqueo: MetaTabla<CabeceraArqueoTpv> = [
    {
        id: "id",
        cabecera: "Código",
    },
    {
        id: "fechahoraApertura",
        cabecera: "Apertura",
        tipo: "fechahora",
    },
    {
        id: "abierto",
        cabecera: "Abierto",
    },
];