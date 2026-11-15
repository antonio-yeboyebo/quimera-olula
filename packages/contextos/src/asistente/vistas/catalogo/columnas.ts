import { z } from "zod";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { Entidad } from "@olula/lib/diseño.ts";

export const ColumnaA2uiSchema = z.object({
    id: z.string(),
    cabecera: z.string(),
    tipo: z.enum(["texto", "numero", "moneda", "fecha", "hora", "fechahora", "booleano"]).optional(),
    prioridad: z.enum(["alta", "media", "baja"]).optional(),
    // Divisa fija de la columna (código ISO)…
    divisa: z.string().optional(),
    // …o campo de cada fila con la suya, para listados con documentos en divisas distintas.
    campoDivisa: z.string().optional(),
});

export type ColumnaA2ui = z.infer<typeof ColumnaA2uiSchema>;

const DIVISA_POR_DEFECTO = "EUR";

export const columnasAMetaTabla = (columnas: ColumnaA2ui[]): MetaTabla<Entidad> =>
    columnas.map(({ campoDivisa, ...columna }) =>
        campoDivisa
            ? {
                  ...columna,
                  divisa: (entidad: Entidad) => {
                      const divisa = entidad[campoDivisa];
                      return typeof divisa === "string" && divisa.trim()
                          ? divisa
                          : (columna.divisa ?? DIVISA_POR_DEFECTO);
                  },
              }
            : columna
    );
