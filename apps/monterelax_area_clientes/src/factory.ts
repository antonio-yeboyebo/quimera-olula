import { FactoryAuthOlula } from "#/auth/factory.ts";
import { AccionesCabeceraMonterelax } from "./componentes/AccionesCabeceraMonterelax.tsx";

class FactoryComponentesMonterelax {
    static cabecera_acciones = AccionesCabeceraMonterelax;
}

export class FactoryLegacy {
    Auth = FactoryAuthOlula;
    Componentes = FactoryComponentesMonterelax;
}

export default FactoryLegacy;
