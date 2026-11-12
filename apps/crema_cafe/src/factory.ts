import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryTpvOlula } from '#/tpv/factory.ts';
import { FactoryComunCremaCafe } from './contextos/comun/factory.ts';
import { FactoryVentasCremaCafe } from './contextos/ventas/factory.ts';

export class FactoryCremaCafe {
    Auth = FactoryAuthOlula;
    Comun = FactoryComunCremaCafe;
    Ventas = FactoryVentasCremaCafe;
    TPV = FactoryTpvOlula;
}

export default FactoryCremaCafe;
