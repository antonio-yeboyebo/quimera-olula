import { InformesDocumentos } from "#/comun/informe_documentos/componentes/InformesDocumentos.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";
import { useMemo } from "react";
import { pestañasCompras } from "./pestañas.tsx";

/** Compras > Informes: Pedidos, Albaranes y Facturas. */
export const InformesCompras = () => {
    const t = useTCompras();
    const pestañas = useMemo(() => pestañasCompras(t), [t]);
    return <InformesDocumentos titulo={t("informe.titulo")} pestañas={pestañas} />;
};
