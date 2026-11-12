export type ColumnaAgrupada = {
  id: string;
  cabecera: string;
  grupo?: string[];
};

export type CeldaCabecera = {
  clave: string;
  texto: string;
  colSpan: number;
  rowSpan: number;
  columnaId?: string;
};

export const cabecerasMultinivel = (
  columnas: ColumnaAgrupada[]
): CeldaCabecera[][] => {
  const profundidad = Math.max(0, ...columnas.map((c) => c.grupo?.length ?? 0));

  return Array.from({ length: profundidad + 1 }, (_, nivel) => {
    const fila: CeldaCabecera[] = [];
    let grupoAnterior: string | null = null;

    columnas.forEach(({ id, cabecera, grupo = [] }) => {
      if (nivel < grupo.length) {
        const clave = JSON.stringify(grupo.slice(0, nivel + 1));
        if (clave === grupoAnterior) {
          fila[fila.length - 1].colSpan += 1;
        } else {
          fila.push({ clave, texto: grupo[nivel], colSpan: 1, rowSpan: 1 });
        }
        grupoAnterior = clave;
        return;
      }

      grupoAnterior = null;
      if (nivel === grupo.length) {
        fila.push({
          clave: id,
          texto: cabecera,
          colSpan: 1,
          rowSpan: profundidad + 1 - grupo.length,
          columnaId: id,
        });
      }
    });

    return fila;
  });
};
