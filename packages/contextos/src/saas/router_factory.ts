import { MaestroConDetalleTenant } from "./tenant/maestro/MaestroConDetalleTenant.js";

export class RouterFactorySaas {
    static router = {
        "saas/empresas": MaestroConDetalleTenant,
    };
}
