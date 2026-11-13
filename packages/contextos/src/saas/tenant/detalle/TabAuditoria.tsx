import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { AccesoSoporte } from "../diseño.js";

const metaTablaAcceso: MetaTabla<AccesoSoporte> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fechahora" },
    { id: "usuarioId", cabecera: "Usuario" },
    { id: "accion", cabecera: "Acción" },
    { id: "detalle", cabecera: "Detalle" },
];

export const TabAuditoria = ({ accesos }: { accesos: AccesoSoporte[] }) => (
    <div className="TabAuditoria">
        <QTabla<AccesoSoporte>
            metaTabla={metaTablaAcceso}
            datos={accesos}
            totalEntidades={accesos.length}
            cargando={false}
            orden={[]}
        />
    </div>
);
