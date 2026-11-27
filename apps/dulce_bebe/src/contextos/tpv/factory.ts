import { FactoryTpvOlula } from '#/tpv/factory.ts';
import { CrearVentaDulceBebe } from './venta/crear_venta/CrearVenta.tsx';

export class FactoryTpvDulceBebe extends FactoryTpvOlula {
    static override venta_CrearVenta = CrearVentaDulceBebe
    static override venta_imprimirValesAntesQueTique = true
    static override venta_enviarEfectivoEntregado = true
    // Dulce Bebé no cobra con QR (Stripe): se oculta el botón "P. QR"
    static override venta_pagoConQr = false
}
