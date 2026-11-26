import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ComponentProps } from "react";
import { MAGNITUDES } from "./diseño.ts";
import { descripcionMagnitud } from "./dominio.ts";
import { tAlmacen } from "../i18n/index.ts";

const opciones = MAGNITUDES.map((m) => ({ valor: m, get descripcion() { return descripcionMagnitud(m); } }));

export const MagnitudPesoMedida = (props: Omit<ComponentProps<typeof QSelect>, "opciones" | "label">) => (
    <QSelect label={tAlmacen("peso_medida.magnitud")} opciones={opciones} {...props} />
);
