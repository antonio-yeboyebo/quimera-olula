import { MaestroAcciones } from "./accion/maestro/MaestroAcciones.tsx"
import { MaestroClientes } from "./cliente/maestro/MaestroClientes.tsx"
import { MaestroContactos } from "./contacto/maestro/MaestroContactos.tsx"
import { MaestroIncidencias } from "./incidencia/maestro/MaestroIncidencias.tsx"
import { MaestroLeads } from "./lead/maestro/MaestroLeads.tsx"
import { MaestroOportunidades } from "./oportunidadventa/maestro/MaestroOportunidadesVentas.tsx"
import { OtrosCrm } from "./otros/Config.tsx"

export class RouterFactoryCrmOlula {
    static router = {
        "crm/oportunidadventa": MaestroOportunidades,
        "crm/cliente": MaestroClientes,
        "crm/contacto": MaestroContactos,
        "crm/accion": MaestroAcciones,
        "crm/lead": MaestroLeads,
        "crm/incidencia": MaestroIncidencias,
        "crm/otros": OtrosCrm
    }
}
