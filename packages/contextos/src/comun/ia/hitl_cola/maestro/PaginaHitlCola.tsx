import { FacturaCompletarDatos } from "#/compras/factura/vistas/hitl/FacturaCompletarDatos.tsx";
import { FacturaRevision } from "#/compras/factura/vistas/hitl/FacturaRevision.tsx";
import { MaestroHitlCola } from "./MaestroHitlCola.js";

/**
 * Página de bandeja HITL con los resolvedores registrados para la app olula.
 *
 * Añadir nuevos resolvedores aquí cuando se incorporen nuevos tipos de tarea:
 *   - 'factura_revision'       → FacturaRevision (datos completos, sólo confirmar)
 *   - 'factura_completar_datos' → FacturaCompletarDatos (rellenar campos faltantes)
 */
export const PaginaHitlCola = () => (
    <MaestroHitlCola
        resolvedores={{
            'factura_revision': FacturaRevision,
            'factura_completar_datos': FacturaCompletarDatos,
        }}
    />
);
