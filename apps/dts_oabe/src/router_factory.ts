import { RouterFactoryAnalisisOlula } from '#/analisis/router_factory.ts';
import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryComunOlula } from '#/comun/router_factory.ts';
import { RouterFactoryCrmOlula } from '#/crm/router_factory.ts';
import { Home } from '@olula/componentes/index.ts';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';
import { RouterFactoryVentasDtsOabe } from './contextos/ventas/router_factory.ts';

export class RouterFactoryDtsOabe {
    Inicio = { router: { "": Home } };
    Analisis = RouterFactoryAnalisisOlula;
    Auth = RouterFactoryAuthOlula;
    Comun = RouterFactoryComunOlula;
    Crm = RouterFactoryCrmOlula;
    Ventas = RouterFactoryVentasDtsOabe;
}

export const router = crearRouter(new RouterFactoryDtsOabe() as unknown as Record<string, { router: RouteObject }>);
