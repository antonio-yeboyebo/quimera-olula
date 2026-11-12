import { ResolverImportacionFactura } from "#/compras/factura/vistas/hitl/ResolverImportacionFactura.tsx";
import { MaestroHitlCola } from "./MaestroHitlCola.js";

/**
 * Página de bandeja HITL con los resolvedores registrados para la app olula.
 *
 * Añadir nuevos resolvedores aquí cuando se incorporen nuevos tipos de tarea:
 *   - 'factura_revision' y 'factura_completar_datos' → ResolverImportacionFactura
 *     (validación de la importación de una factura leída de fichero)
 */
export const PaginaHitlCola = () => (
    <MaestroHitlCola
        resolvedores={{
            'factura_revision': ResolverImportacionFactura,
            'factura_completar_datos': ResolverImportacionFactura,
        }}
    />
);
