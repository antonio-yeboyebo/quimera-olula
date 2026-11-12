import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryTpvOlula } from '#/tpv/router_factory.ts';
import { FondoInicio } from '@olula/componentes/plantilla/FondoInicio.tsx';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';
import { RouterFactoryComunCremaCafe } from './contextos/comun/router_factory.ts';
import { RouterFactoryVentasCremaCafe } from './contextos/ventas/router_factory.ts';

export class RouterFactoryCremaCafe {
    Inicio = { router: { "": FondoInicio } };
    Auth = RouterFactoryAuthOlula;
    Comun = RouterFactoryComunCremaCafe;
    Ventas = RouterFactoryVentasCremaCafe;
    Tpv = RouterFactoryTpvOlula;
}

export const router = crearRouter(new RouterFactoryCremaCafe() as unknown as Record<string, { router: RouteObject }>);
