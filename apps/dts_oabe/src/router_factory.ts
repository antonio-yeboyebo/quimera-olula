import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryCrmOlula } from '#/crm/router_factory.ts';
import { Home } from '@olula/componentes/index.ts';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';
import { RouterFactoryInformesDtsOabe } from './contextos/informes/router_factory.ts';

export class RouterFactoryDtsOabe {
    Inicio = { router: { "": Home } };
    Auth = RouterFactoryAuthOlula;
    Crm = RouterFactoryCrmOlula;
    Informes = RouterFactoryInformesDtsOabe;
}

export const router = crearRouter(new RouterFactoryDtsOabe() as unknown as Record<string, { router: RouteObject }>);
