import { FactoryAnalisisOlula } from '#/analisis/factory.ts';
import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryCrmOlula } from '#/crm/factory.ts';
import { FactoryVentasDtsOabe } from './contextos/ventas/factory.ts';

export class FactoryDtsOabe {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Analisis = FactoryAnalisisOlula;
    Auth = FactoryAuthOlula;
    Crm = FactoryCrmOlula;
    Ventas = FactoryVentasDtsOabe;
}

export default FactoryDtsOabe;
