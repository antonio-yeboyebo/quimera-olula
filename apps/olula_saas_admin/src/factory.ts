import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactorySaas } from '#/saas/factory.ts';
import { OlulaWordmark } from '@olula/componentes/tema/Olula.jsx';

class FactoryComponentesSaasAdmin {
    static cabecera_logo = () => OlulaWordmark({ color: '#ffffff', bowlColor: '#ffffff', className: 'logo-app', style: {} });
}

export class FactorySaasAdmin {
    Componentes = FactoryComponentesSaasAdmin;
    Auth = FactoryAuthOlula;
    Saas = FactorySaas;
}

export default FactorySaasAdmin;
