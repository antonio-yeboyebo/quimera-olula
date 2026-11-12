import ventas from "@quimera-extension/base-ventas";
import core from "@quimera-extension/core";
import login from "@quimera-extension/login";

import AppMenu from "./static/appmenu";
import schemas from "./static/schemas";
import * as Agenda from "./views/Agenda";
import * as BiDashboard from "./views/BiDashboard";
import * as BiFiltros from "./views/BiDashboard/BiFiltros";
import * as BiDetalleVentasAgente from "./views/BiDetalleVentasAgente";
import * as BiDetalleVentasComunidad from "./views/BiDetalleVentasComunidad";
import * as BiRecomendaciones from "./views/BiRecomendaciones";
import * as BiSegmentos from "./views/BiSegmentos";
import * as BiVentasAgente from "./views/BiVentasAgente";
import * as BiVentasComunidad from "./views/BiVentasComunidad";
import * as Campania from "./views/Campania";
import * as CampaniaLeadsNueva from "./views/CampaniaLeadsNueva";
import * as CampaniaNueva from "./views/CampaniaNueva";
import * as Campanias from "./views/Campanias";
import * as FilterCampanias from "./views/Campanias/FilterCampanias";
import * as MasterCampanias from "./views/Campanias/MasterCampanias";
import * as CampaniasLeads from "./views/CampaniasLeads";
import * as FilterCampaniasLeads from "./views/CampaniasLeads/FilterCampaniasLeads";
import * as MasterCampaniasLeads from "./views/CampaniasLeads/MasterCampaniasLeads";
import * as Cliente from "./views/Cliente";
import * as Clientes from "./views/Clientes";
import * as FilterClientes from "./views/Clientes/FilterClientes";
import * as MasterClientes from "./views/Clientes/MasterClientes";
import * as Contacto from "./views/Contacto";
import * as ContactoMD from "./views/ContactoMD";
import * as Contactos from "./views/Contactos";
import * as ContactosMD from "./views/ContactosMD";
import * as FilterContactosMD from "./views/ContactosMD/FilterContactosMD";
import * as MasterContactosMD from "./views/ContactosMD/MasterContactosMD";
import * as Container from "./views/Container";
import * as Curso from "./views/Curso";
import * as Cursos from "./views/Cursos";
import * as FilterCursos from "./views/Cursos/FilterCursos";
import * as MasterCursos from "./views/Cursos/MasterCursos";
import * as Dashboard from "./views/Dashboard";
import * as DataLoad from "./views/DataLoad";
import * as EditarContactoCampania from "./views/EditarContactoCampania";
import * as EstadoTrato from "./views/EstadoTrato";
import * as Evento from "./views/Evento";
import * as Graficos from "./views/Graficos";
import * as Header from "./views/Header";
import * as HistoricoPrevision from "./views/HistoricoPrevision";
import * as Home from "./views/Home";
import * as Incidencia from "./views/Incidencia";
import * as Incidencias from "./views/Incidencias";
import * as FilterIncidencias from "./views/Incidencias/FilterIncidencias";
import * as MasterIncidencias from "./views/Incidencias/MasterIncidencias";
import * as InformeTareasAgente from "./views/InformeTareasAgente";
import * as NuevaTarea from "./views/NuevaTarea";
import * as NuevoContacto from "./views/NuevoContacto";
import * as NuevoContactoMD from "./views/NuevoContactoMD";
import * as NuevoCurso from "./views/NuevoCurso";
import * as NuevoTrato from "./views/NuevoTrato";
import * as PedidosCliNuevo from "./views/PedidosCliNuevo";
import * as PedidosCliOtrosAgentes from "./views/PedidosCliOtrosAgentes";
import * as PedidoDirCliente from "./views/PedidosCliOtrosAgentes/DirCliente";
import * as PedidoDetalle from "./views/PedidosCliOtrosAgentes/PedidoDetalle";
import * as PedidosFiltro from "./views/PedidosCliOtrosAgentes/PedidosFiltro";
import * as PedidosMaster from "./views/PedidosCliOtrosAgentes/PedidosMaster";
import * as RecomCliente from "./views/RecomCliente";
import * as RecomMapa from "./views/RecomMapa";
import * as RecomSubfamilia from "./views/RecomSubfamilia";
import * as RegNoEncontrado from "./views/RegNoEncontrado";
import * as Tarea from "./views/Tarea";
import * as Tareas from "./views/Tareas";
import * as MasterTareas from "./views/Tareas/MasterTareas";
import * as TiposTrato from "./views/TiposTrato";
import * as DetalleTiposTrato from "./views/TiposTrato/DetalleTiposTrato";
import * as MasterTiposTrato from "./views/TiposTrato/MasterTiposTrato";
import * as NuevoTipoTrato from "./views/TiposTrato/NuevoTipoTrato";
import * as Trato from "./views/Trato";
import * as TratoCampania from "./views/TratoCampania";
import * as Tratos from "./views/Tratos";
import * as MasterTratos from "./views/Tratos/MasterTratos";
import * as TratosCampania from "./views/TratosCampania";
import * as MasterTratosCampania from "./views/TratosCampania/MasterTratosCampania";
import * as TratosFarma from "./views/TratosFarma";
import * as MasterTratosFarma from "./views/TratosFarma/MasterTratosFarma";
import * as TratosMkt from "./views/TratosMkt";
import * as MasterTratosMkt from "./views/TratosMkt/MasterTratosMkt";
import * as User from "./views/User";
import * as Users from "./views/Users";
import * as UsersDetalle from "./views/Users/DetalleUsers";
import * as Welcome from "./views/Welcome";

export * from "./comps";

export default {
  path: "extensions/sanhigia/smartsales",
  views: {
    Agenda,
    BiDashboard,
    BiVentasAgente,
    BiDetalleVentasAgente,
    BiVentasComunidad,
    BiDetalleVentasComunidad,
    BiSegmentos,
    BiRecomendaciones,
    Campanias,
    Campania,
    CampaniasLeads,
    CampaniaNueva,
    CampaniaLeadsNueva,
    ContactoMD,
    ContactosMD,
    Contactos,
    Contacto,
    Container,
    Cliente,
    Clientes,
    Cursos,
    Curso,
    Dashboard,
    DataLoad,
    EditarContactoCampania,
    EstadoTrato,
    Evento,
    Graficos,
    Header,
    HistoricoPrevision,
    Home,
    Incidencia,
    Incidencias,
    InformeTareasAgente,
    NuevoContacto,
    NuevoContactoMD,
    NuevoCurso,
    NuevoTrato,
    NuevaTarea,
    PedidosCliNuevo,
    PedidosCliOtrosAgentes,
    RecomCliente,
    RecomSubfamilia,
    RecomMapa,
    RegNoEncontrado,
    Tareas,
    Tarea,
    TiposTrato,
    Tratos,
    TratosMkt,
    TratosFarma,
    TratoCampania,
    TratosCampania,
    Trato,
    User,
    Users,
    Welcome,
  },
  subviews: {
    "BiDashboard/BiFiltros": BiFiltros,
    "Campanias/MasterCampanias": MasterCampanias,
    "Campanias/FilterCampanias": FilterCampanias,
    "CampaniasLeads/MasterCampaniasLeads": MasterCampaniasLeads,
    "CampaniasLeads/FilterCampaniasLeads": FilterCampaniasLeads,
    "ContactosMD/MasterContactosMD": MasterContactosMD,
    "ContactosMD/FilterContactosMD": FilterContactosMD,
    "Clientes/MasterClientes": MasterClientes,
    "Clientes/FilterClientes": FilterClientes,
    "Cursos/MasterCursos": MasterCursos,
    "Cursos/FilterCursos": FilterCursos,
    "PedidosCliOtrosAgentes/DirCliente": PedidoDirCliente,
    "Incidencias/MasterIncidencias": MasterIncidencias,
    "Incidencias/FilterIncidencias": FilterIncidencias,
    "PedidosCliOtrosAgentes/PedidosMaster": PedidosMaster,
    "PedidosCliOtrosAgentes/PedidosFiltro": PedidosFiltro,
    "PedidosCliOtrosAgentes/PedidoDetalle": PedidoDetalle,
    "Tratos/MasterTratos": MasterTratos,
    "TratosMkt/MasterTratosMkt": MasterTratosMkt,
    "TratosFarma/MasterTratosFarma": MasterTratosFarma,
    "TratosCampania/MasterTratosCampania": MasterTratosCampania,
    "Tareas/MasterTareas": MasterTareas,
    "TiposTrato/MasterTiposTrato": MasterTiposTrato,
    "TiposTrato/DetalleTiposTrato": DetalleTiposTrato,
    "TiposTrato/NuevoTipoTrato": NuevoTipoTrato,
    "Users/DetalleUsers": UsersDetalle,
    "NuevoCurso/NuevoCurso": NuevoCurso,
  },
  routes: {
    "/": { type: "view", view: "Home" },
    "/ss": { type: "view", view: "Dashboard" },
    "/ss/dashboard-legacy": { type: "view", view: "Dashboard" },
    "/ss/contacto/nuevo": { type: "view", view: "NuevoContacto" },
    "/ss/trato/nuevo": { type: "view", view: "NuevoTrato" },
    "/ss/tarea/nueva": { type: "view", view: "NuevaTarea" },
    "/ss/trato/:idTrato/tarea/nueva": { type: "view", view: "NuevaTarea" },
    "/ss/trato/:idTrato/tarea/nueva/:tipoTarea": { type: "view", view: "NuevaTarea" },
    "/ss/contacto/:idContacto/trato/nuevo": {
      type: "view",
      view: "NuevoTrato",
    },
    "/ss/contacto/:idContacto": { type: "view", view: "Contacto" },
    "/ss/tratos": { type: "view", view: "Tratos" },
    "/ss/tratos/modo/:modo": { type: "view", view: "Tratos" },
    "/ss/tratos/modo/:modo/:idTrato": { type: "view", view: "Tratos" },
    "/ss/tratos/:idTrato": { type: "view", view: "Tratos" },
    "/ss/trato/:idTrato": { type: "view", view: "Trato" },
    "/ss/campania/:idCampania/tratos": { type: "view", view: "TratosCampania" },
    "/ss/tratosmkt": { type: "view", view: "TratosMkt" },
    "/ss/tratosmkt/:idTrato": { type: "view", view: "TratosMkt" },
    "/ss/tratosfarma": { type: "view", view: "TratosFarma" },
    "/ss/tratosfarma/:idTrato": { type: "view", view: "TratosFarma" },
    "/ss/campania/:idCampania/tratos/:idTrato": { type: "view", view: "TratosCampania" },
    "/ss/tarea/:idTarea": { type: "view", view: "Tarea" },
    "/ss/tareas": { type: "view", view: "Tareas" },
    "/ss/tareas/:idTarea": { type: "view", view: "Tareas" },
    "/ss/campania/:idCampania/tratos/:idTrato/tarea/:idTarea": { type: "view", view: "Tarea" },
    "/ss/tarea/:idTarea/:tipoTarea": { type: "view", view: "Tarea" },
    "/ss/contactos/": { type: "view", view: "Contactos" },
    "/ss/contactos/:search": { type: "view", view: "Contactos" },
    "/ss/contactos/:tipo/": { type: "view", view: "Contactos" },
    "/ss/contactosmd": { type: "view", view: "ContactosMD" },
    "/ss/contactosmd/:codContacto": { type: "view", view: "ContactosMD" },
    "/ss/ventas/pedidos/otrosagentes": { type: "view", view: "PedidosCliOtrosAgentes" },
    "/ss/ventas/pedidos/otrosagentes/:idPedido": { type: "view", view: "PedidosCliOtrosAgentes" },
    "/ss/evento/:codEvento": { type: "view", view: "Evento" },
    "/ss/recom-subfamilia/:subfamilia": {
      type: "view",
      view: "RecomSubfamilia",
    },
    "/ss/recom-cliente/:cliente/:direccion": {
      type: "view",
      view: "RecomCliente",
    },
    "/ss/recom-mapa": { type: "view", view: "RecomMapa" },
    "/ss/agenda": { type: "view", view: "Agenda" },
    "/ss/bi": { type: "view", view: "BiDashboard" },
    "/ss/bi/ventasagente": { type: "view", view: "BiDetalleVentasAgente" },
    "/ss/bi/ventasagente/:codAgente/:codFamilia": {
      type: "view",
      view: "BiDetalleVentasAgente",
    },
    "/ss/bi/ventascomunidad": {
      type: "view",
      view: "BiDetalleVentasComunidad",
    },
    "/ss/bi/ventascomunidad/:comunidad/:codFamilia": {
      type: "view",
      view: "BiDetalleVentasComunidad",
    },
    "/ss/tipostrato": { type: "view", view: "TiposTrato" },
    "/ss/tipostrato/:idTipoTrato": { type: "view", view: "TiposTrato" },
    "/ss/historico/": { type: "view", view: "Graficos" },
    "/ss/campanias/nueva": { type: "view", view: "CampaniaNueva" },
    "/ss/campanias": { type: "view", view: "Campanias" },
    "/ss/campanias/:idCampania": { type: "view", view: "Campanias" },
    "/ss/dataload": { type: "view", view: "DataLoad" },
    "/ss/cursos": { type: "view", view: "Cursos" },
    "/ss/cursos/:codCurso": { type: "view", view: "Cursos" },
    "/informe-tareas-agente": { type: "view", view: "InformeTareasAgente" },
    "/ss/clientes": { type: "view", view: "Clientes" },
    "/ss/clientes/:codCliente": { type: "view", view: "Clientes" },
    "/ss/cliente/:codCliente": { type: "view", view: "Cliente" },
    "/ss/leadpacientes/nueva": { type: "view", view: "CampaniaLeadsNueva" },
    "/ss/leadpacientes": { type: "view", view: "CampaniasLeads" },
    "/ss/leadpacientes/:idCampania": { type: "view", view: "CampaniasLeads" },
    "/ss/leadpacientes/:idCampania/tratos": { type: "view", view: "TratosCampania" },
    "/ss/leadpacientes/:idCampania/tratos/:idTrato": { type: "view", view: "TratosCampania" },
    "/ss/incidencias": { type: "view", view: "Incidencias" },
    "/ss/incidencias/:codIncidencia": { type: "view", view: "Incidencias" },
    "/ss/incidencias/:codIncidencia/tarea/nueva": { type: "view", view: "NuevaTarea" },
    "/ss/incidencias/:codIncidencia/tarea/nueva/:tipoTarea": { type: "view", view: "NuevaTarea" },
  },
  dependencies: [core, login, ventas],
  menus: {
    app: AppMenu,
  },
  rules: {
    "Dashboard:visit": (check: (rule: string) => boolean) => check("crm.trato"),
    "OnlyAdmin:visit": false,
    "ss_campanias:visit": (check: (rule: string) => boolean) => check("ss_campanias.leer"),
    "ss_informes:visit": (check: (rule: string) => boolean) => check("crm.informe"),
    "Trato:boton-borrar": (check: (rule: string) => boolean) => check("crm.trato.borrar"),
    "TratosFarma:visit": (check: (rule: string) => boolean) => check("crm.trato.farma"),
    "ss_informes:marketing": (check: (rule: string) => boolean) => check("crm.informe.marketing"),
    "ss_informes:todoslosagentes": (check: (rule: string) => boolean) =>
      check("crm.informe.todos_los_agentes"),
    "clientes:acceso": (check: (rule: string) => boolean) => check("ventas.cliente.leer"),
    "lead_pacientes:visit": (check: (rule: string) => boolean) =>
      check("crm.campana.lead_pacientes"),
    "articulos:acceso_caducidad": (check: (rule: string) => boolean) =>
      check("almacen.articulo.leer_caducidad"),
    "contactos:revisar_contacto": (check: (rule: string) => boolean) =>
      check("crm.contacto.revisar_contacto"),
    "LicenciasFarma:visit": (check: (rule: string) => boolean) => check("ventas.licencia_farma"),
  },
  schemas,
};
