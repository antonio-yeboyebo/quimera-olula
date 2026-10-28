import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryCrmOlula } from '#/crm/factory.ts';
import { FactoryInformesDtsOabe } from './contextos/informes/factory.ts';

export class FactoryDtsOabe {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Auth = FactoryAuthOlula;
    Crm = FactoryCrmOlula;
    Informes = FactoryInformesDtsOabe;
}

export default FactoryDtsOabe;
