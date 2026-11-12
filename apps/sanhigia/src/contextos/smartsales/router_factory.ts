import { Agenda } from "./agenda/detalle/Agenda.tsx";
import { Campanias } from "./campanias/maestro/Campanias.tsx";
import { DetalleCampania } from "./campanias/detalle/DetalleCampania.tsx";
import { NuevaCampania } from "./campanias/crear/NuevaCampania.tsx";
import { Clientes } from "./clientes/maestro/Clientes.tsx";
import { FichaCliente } from "./clientes/detalle/FichaCliente.tsx";
import { FichaContacto } from "./contacto/detalle/FichaContacto.tsx";
import { NuevoContacto } from "./contacto/crear/NuevoContacto.tsx";
import { Hoy } from "./hoy/detalle/Hoy.tsx";
import { TareasAtrasadas } from "./hoy/maestro/TareasAtrasadas.tsx";
import { NuevaTarea } from "./nueva_tarea/crear/NuevaTarea.tsx";
import { Objetivos } from "./objetivos/detalle/Objetivos.tsx";
import { FiltrosProspeccion } from "./prospeccion/maestro/FiltrosProspeccion.tsx";
import { MapaClientes } from "./prospeccion/maestro/MapaClientes.tsx";
import { Rendimiento } from "./rendimiento/detalle/Rendimiento.tsx";
import { DetalleTrato } from "./trato/detalle/DetalleTrato.tsx";
import { NuevoTrato } from "./tratos/crear/NuevoTrato.tsx";
import { Tratos } from "./tratos/maestro/Tratos.tsx";
import { Visita } from "./visita/detalle/Visita.tsx";

export class RouterFactorySmartsalesSanhigia {
    static router = {
        "ss/dashboard": Hoy,
        "ss/dashboard/atrasadas": TareasAtrasadas,
        "ss/mi-agenda": Agenda,
        "ss/mi-tarea/nueva": NuevaTarea,
        "ss/mi-tarea/:id": Visita,
        "ss/mis-clientes": Clientes,
        "ss/mis-clientes/:codCliente": FichaCliente,
        "ss/mi-contacto/nuevo": NuevoContacto,
        "ss/mi-contacto/:codContacto": FichaContacto,
        "ss/mis-tratos": Tratos,
        "ss/mi-trato/nuevo": NuevoTrato,
        "ss/mi-trato/:id": DetalleTrato,
        "ss/mi-rendimiento": Rendimiento,
        "ss/mi-objetivo": Objetivos,
        "ss/mis-campanias": Campanias,
        "ss/mis-campanias/nueva": NuevaCampania,
        "ss/mis-campanias/:id": DetalleCampania,
        "ss/mapa": MapaClientes,
        "ss/prospeccion": FiltrosProspeccion,
    };
}
