import { FactoryAlmacenOlula } from '#/almacen/factory.ts';
import { FactoryAnalisisOlula } from '#/analisis/factory.ts';
import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryComprasOlula } from '#/compras/factory.ts';
import { FactoryContabilidadOlula } from '#/contabilidad/factory.ts';
import { FactoryComunOlula } from '#/comun/factory.ts';
import { FactoryCrmOlula } from '#/crm/factory.ts';
import { FactoryEmpresaOlula } from '#/empresa/factory.ts';
import { SelectorEmpresaActual } from '#/empresa/empresa/componentes/SelectorEmpresaActual.tsx';
import { FactoryPrediccionesOlula } from '#/predicciones/factory.ts';
import { FactoryProyectosOlula } from '#/proyectos/factory.ts';
import { FactoryRrhhOlula } from '#/rrhh/factory.ts';
import { FactoryTesoreriaOlula } from '#/tesoreria/factory.ts';
import { FactoryTpvOlula } from '#/tpv/factory.ts';
import { FactoryVentasOlula } from '#/ventas/factory.ts';
import { FactoryComponentesOlula } from '@olula/componentes/factory.ts';
import { AsistenteLateralOlula } from './AsistenteLateral.tsx';

// Override propio de esta app, no de la clase base compartida: así cualquier otro
// proyecto que reutilice FactoryComponentesOlula tal cual sigue sin ver el asistente
// (Plantilla.tsx no renderiza nada si Componentes.panel_asistente no está definido).
class FactoryComponentesOlulaConAsistente extends FactoryComponentesOlula {
    static panel_asistente = AsistenteLateralOlula;
    static cabecera_acciones = SelectorEmpresaActual;
}

export class FactoryOlula {
    Inicio = { menu: { "Inicio": { url: "/", icono: "inicio" } } };
    Componentes = FactoryComponentesOlulaConAsistente;
    Almacen = FactoryAlmacenOlula;
    Crm = FactoryCrmOlula;
    Empresa = FactoryEmpresaOlula;
    Ventas = FactoryVentasOlula;
    Compras = FactoryComprasOlula;
    Contabilidad = FactoryContabilidadOlula;
    TPV = FactoryTpvOlula;
    Predicciones = FactoryPrediccionesOlula;
    Analisis = FactoryAnalisisOlula;
    Auth = FactoryAuthOlula;
    Rrhh = FactoryRrhhOlula;
    Proyectos = FactoryProyectosOlula;
    Tesoreria = FactoryTesoreriaOlula;
    Comun = FactoryComunOlula;
}

export default FactoryOlula;