import { RouterFactoryAlmacenOlula } from "#/almacen/router_factory.ts";
import { RouterFactoryAuthOlula } from "#/auth/router_factory.ts";
import { RouterFactoryComunOlula } from "#/comun/router_factory.ts";
// import { RouterFactoryVentasOlula } from "#/ventas/router_factory.ts";
import { crearRouter } from "@olula/lib/router.ts";
import { RouteObject } from "react-router";
import { RouterFactoryCrmSanhigia } from "./contextos/crm/router_factory.ts";
import { RouterFactoryInformesSanhigia } from "./contextos/informes/router_factory.ts";
import { RouterFactorySmartsalesSanhigia } from "./contextos/smartsales/router_factory.ts";
import { RouterFactoryVentasSanhigia } from "./contextos/ventas/router_factory.ts";


// export class RouterFactoryLegacy extends RouterFactoryOlula {
//     Inicio = undefined;
//     Crm = undefined;
// }
export class RouterFactoryLegacy {
    Almacen = RouterFactoryAlmacenOlula;
    Ventas = RouterFactoryVentasSanhigia;
    Crm = RouterFactoryCrmSanhigia;
    Informes = RouterFactoryInformesSanhigia;
    Smartsales = RouterFactorySmartsalesSanhigia;
    Auth = RouterFactoryAuthOlula;
    Comun = RouterFactoryComunOlula;
}

export const router = crearRouter(new RouterFactoryLegacy() as unknown as Record<string, { router: RouteObject }>);
