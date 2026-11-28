import { InformesDocumentos } from "#/comun/informe_documentos/componentes/InformesDocumentos.tsx";
import { useMemo } from "react";
import { useTVentas } from "../i18n/index.ts";
import { pestañasVentas } from "./pestañas.tsx";

/** Ventas > Informes: Presupuestos, Pedidos, Albaranes y Facturas. */
export const InformesVentas = () => {
    const t = useTVentas();
    const pestañas = useMemo(() => pestañasVentas(t), [t]);
    return <InformesDocumentos titulo={t("informe.titulo")} pestañas={pestañas} />;
};
