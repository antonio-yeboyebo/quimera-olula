import { PaginaAsistente } from "#/asistente/vistas/PaginaAsistente.tsx";
import { MaestroConDetalleComunicacion } from "./comunicacion/maestro/MaestroConDetalleComunicacion.tsx";
import { MaestroConDetalleCredencialExterna } from "./credencial_externa/maestro/MaestroConDetalleCredencialExterna.tsx";
import { PaginaHitlCola } from "./ia/hitl_cola/maestro/PaginaHitlCola.tsx";
import { MaestroConDetalleIaFlujo } from "./ia_flujo/maestro/MaestroConDetalleIaFlujo.tsx";
import { MaestroConDetalleIaMemoria } from "./ia_memoria/maestro/MaestroConDetalleIaMemoria.tsx";
import { MaestroConDetalleIaTareaProgramada } from "./tarea_programada_ia/maestro/MaestroConDetalleIaTareaProgramada.tsx";

export class RouterFactoryComunOlula {
    static router = {
        "comun/comunicacion": MaestroConDetalleComunicacion,
        "comun/comunicacion/:id": MaestroConDetalleComunicacion,
        "comun/asistente": PaginaAsistente,
        "comun/ia-memoria": MaestroConDetalleIaMemoria,
        "comun/ia-memoria/:id": MaestroConDetalleIaMemoria,
        "comun/ia-flujo": MaestroConDetalleIaFlujo,
        "comun/ia-flujo/:id": MaestroConDetalleIaFlujo,
        "comun/ia-tarea-programada": MaestroConDetalleIaTareaProgramada,
        "comun/ia-tarea-programada/:id": MaestroConDetalleIaTareaProgramada,
        "comun/credencial-externa": MaestroConDetalleCredencialExterna,
        "comun/credencial-externa/:id": MaestroConDetalleCredencialExterna,
        "comun/hitl-cola": PaginaHitlCola,
    };
}
