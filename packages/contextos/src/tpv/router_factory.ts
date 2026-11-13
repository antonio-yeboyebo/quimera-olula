import { MaestroConDetalleArqueoTpv } from "./arqueo/Maestro/MaestroConDetalleArqueoTpv.tsx";
import { MaestroConDetalleVentaTpv } from "./venta/maestro/MaestroConDetalleVentaTpv.tsx";
import { VisorClienteTpv } from "./visor/VisorClienteTpv.tsx";

export class RouterFactoryTpvOlula {
    static router = {
        "tpv/venta": MaestroConDetalleVentaTpv,
        "tpv/arqueo": MaestroConDetalleArqueoTpv,
        // Visor de cliente: segunda ventana con el QR de pago (ver visor/canal.ts).
        "tpv/visor": VisorClienteTpv,
    }
}
