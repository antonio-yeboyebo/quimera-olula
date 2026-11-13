import { MaestroConDetalleCredencialExterna } from '#/comun/credencial_externa/maestro/MaestroConDetalleCredencialExterna.tsx';

export class RouterFactoryComunCremaCafe {
    static router = {
        "comun/credencial-externa": MaestroConDetalleCredencialExterna,
        "comun/credencial-externa/:id": MaestroConDetalleCredencialExterna,
    };
}
