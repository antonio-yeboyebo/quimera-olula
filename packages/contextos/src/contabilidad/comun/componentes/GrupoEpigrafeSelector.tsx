import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { GrupoEpigrafe } from "#/contabilidad/grupo_epigrafe/diseño.ts";
import {
    getGrupoEpigrafe,
    getGruposEpigrafes,
} from "#/contabilidad/grupo_epigrafe/infraestructura.ts";
import { tContabilidad } from "../../i18n/index.ts";

export type OpcionGrupoEpigrafe = {
    valor: string;
    descripcion: string;
    descripcionOpcion: string;
};

interface GrupoEpigrafeSelectorProps {
    ejercicioId: string;
    valor: string;
    descripcion?: string;
    nombre?: string;
    label?: string;
    opcional?: boolean;
    onChange: (opcion: OpcionGrupoEpigrafe | null) => void;
}

const opcionDesdeGrupo = (g: GrupoEpigrafe): OpcionGrupoEpigrafe => ({
    valor: g.id,
    descripcion: g.codigo,
    descripcionOpcion: g.descripcion
        ? `${g.codigo} — ${g.descripcion}`
        : g.codigo,
});

export const GrupoEpigrafeSelector = ({
    ejercicioId,
    valor,
    descripcion = "",
    nombre = "grupo_id",
    label = tContabilidad("comun.grupo"),
    onChange,
    ...props
}: GrupoEpigrafeSelectorProps) => {
    const obtenerOpciones = async (texto: string, id?: string) => {
        if (id) {
            try {
                const grupo = await getGrupoEpigrafe(id);
                return [opcionDesdeGrupo(grupo)];
            } catch {
                return [];
            }
        }

        if (!ejercicioId) {
            return [];
        }

        const filtro: Filtro = texto.trim().length
            ? {
                  and: [
                      ["ejercicio_id", ejercicioId],
                      {
                          or: [
                              ["codigo", "~", texto],
                              ["descripcion", "~", texto],
                          ],
                      },
                  ],
              }
            : [["ejercicio_id", ejercicioId]];

        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro,
            orden: ["codigo", "ASC"],
            paginacion: { pagina: 1, limite: 50 },
        };

        const { datos } = await getGruposEpigrafes(criteria);
        return datos.map(opcionDesdeGrupo);
    };

    return (
        <QAutocompletar<OpcionGrupoEpigrafe>
            label={label}
            nombre={nombre}
            valor={valor}
            descripcion={descripcion}
            onChange={onChange}
            obtenerOpciones={obtenerOpciones}
            longitudMinima={0}
            {...props}
        />
    );
};
