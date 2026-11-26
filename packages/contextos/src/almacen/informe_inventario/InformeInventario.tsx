import { MaestroInforme } from "#/comun/informe_documentos/componentes/MaestroInforme.tsx";
import "#/comun/informe_documentos/componentes/InformesDocumentos.css";
import "./InformeInventario.css";
import { INFORME_INVENTARIO, INFORME_INVENTARIO_VALORADO } from "./pestañas.ts";
import { tAlmacen } from "../i18n/index.ts";

/** Almacén > Informe inventario: fichas de criterios y stock por almacén. */
export const InformeInventario = () => (
    <div className="InformesDocumentos InformeInventario">
        <h2>{tAlmacen("informe_inventario.informeInventario")}</h2>
        <MaestroInforme pestaña={INFORME_INVENTARIO} />
    </div>
);

/** Almacén > Informe inventario valorado: igual, con precio, valor y totales. */
export const InformeInventarioValorado = () => (
    <div className="InformesDocumentos InformeInventario">
        <h2>{tAlmacen("informe_inventario.informeInventarioValorado")}</h2>
        <MaestroInforme pestaña={INFORME_INVENTARIO_VALORADO} />
    </div>
);
