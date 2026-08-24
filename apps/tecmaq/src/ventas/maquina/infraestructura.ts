import { Criteria } from "@olula/lib/diseño.ts";
import { GetMaquina, GetMaquinas, ItemMaquina, Maquina } from "./diseño.ts";
import { MAQUINAS_MOCK } from "./dominio.ts";

export const getMaquinas: GetMaquinas = async (criteria: Criteria) => {
    void criteria;
    const items: ItemMaquina[] = MAQUINAS_MOCK.map(
        ({ componentes: _componentes, ...rest }) => rest
    );
    return Promise.resolve({ datos: items, total: items.length });
};

export const getMaquina: GetMaquina = async (id: string) => {
    const maquina = MAQUINAS_MOCK.find((m) => m.id === id);
    if (!maquina) {
        return Promise.reject(new Error(`Máquina no encontrada: ${id}`));
    }
    return Promise.resolve(maquina as Maquina);
};
