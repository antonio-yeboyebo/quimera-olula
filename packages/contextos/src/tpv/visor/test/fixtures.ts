import { VentaVisor } from "../diseño.ts";

export const ventaVisor = (cambios: Partial<VentaVisor> = {}): VentaVisor => ({
    id: "v1",
    codigo: "T0001",
    divisaId: "EUR",
    lineas: [
        { id: "l1", descripcion: "Café", cantidad: 2, pvpUnitario: 1.5, dtoPorcentual: 0, total: 3 },
        { id: "l2", descripcion: "Tostada", cantidad: 1, pvpUnitario: 9.5, dtoPorcentual: 0, total: 9.5 },
    ],
    total: 12.5,
    pagado: 0,
    pendiente: 12.5,
    ...cambios,
});
