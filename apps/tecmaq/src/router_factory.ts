import { RouterFactoryAuthOlula } from "#/auth/router_factory.ts";
import { RouterFactoryVentasOlula } from "#/ventas/router_factory.ts";
import { FondoInicio } from "@olula/componentes/plantilla/FondoInicio.tsx";
import { crearRouter } from "@olula/lib/router.ts";
import { RouteObject } from "react-router";
import { MaestroConDetalleMaquina } from "./ventas/maquina/vistas/maestro/MaestroConDetalleMaquina.tsx";

class RouterFactoryVentasTecmaq extends RouterFactoryVentasOlula {
    static router = {
        ...RouterFactoryVentasOlula.router,
        "ventas/maquina": MaestroConDetalleMaquina,
    };
}

export class RouterFactoryTecmaq {
    Inicio = { router: { "": FondoInicio } };
    Auth = RouterFactoryAuthOlula;
    Ventas = RouterFactoryVentasTecmaq;
}

export const router = crearRouter(new RouterFactoryTecmaq() as unknown as Record<string, { router: RouteObject }>);
