// import { MaestroConDetalleIncidencia } from "./incidencia/maestro/MaestroConDetalleIncidencia.tsx";
import { MaestroIncidencias } from "./incidencia/maestro/MaestroIncidencias.tsx";
import { MaestroConDetalleMotivoTarea } from "./motivoTarea/maestro/MaestroConDetalleMotivoTarea.tsx";

export class RouterFactoryCrmSanhigia {
    static router = {
        // "crm/incidencia": MaestroConDetalleIncidencia,
        "crm/incidencia": MaestroIncidencias,
        "crm/motivo_tarea": MaestroConDetalleMotivoTarea,
        "crm/motivo_tarea/:id": MaestroConDetalleMotivoTarea,
    };
}
