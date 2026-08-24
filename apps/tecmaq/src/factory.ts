import { FactoryAuthOlula } from "#/auth/factory.ts";
import { FactoryVentasOlula } from "#/ventas/factory.ts";
import { menuVentas } from "#/ventas/menu.ts";

class FactoryVentasTecmaq extends FactoryVentasOlula {
    static menu = {
        ...menuVentas,
        "Ventas/Maquina": { url: "/ventas/maquina", icono: "lista" },
    };
}

export class FactoryTecmaq {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Auth = FactoryAuthOlula;
    Ventas = FactoryVentasTecmaq;
}

export default FactoryTecmaq;
