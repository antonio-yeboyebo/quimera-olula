import * as HistoriasBoton from "../atomos/qboton.historias.ts";
import * as HistoriasCheckbox from "../atomos/qcheckbox.historias.ts";
import * as HistoriasDate from "../atomos/qdate.historias.ts";
import * as HistoriasInput from "../atomos/qinput.historias.ts";
import * as HistoriasSelect from "../atomos/qselect.historias.ts";
import * as HistoriasMenuLateral from "../menu/menu-lateral.historias.tsx";
import * as HistoriasAcciones from "../moleculas/qacciones.historias.ts";
import * as HistoriasModal from "../moleculas/qmodal.historias.ts";
import * as HistoriasTextoEnriquecido from "../moleculas/qtexto_enriquecido/historias.ts";
import * as HistoriasSelectorColumnas from "../vistas/selector_columnas.historias.ts";
// import * as HistoriasClientes from "../vista/clientes.historias.tsx";
// import * as HistoriasHome from "../vista/home.historias.tsx";
import { HistoriasComponente } from "./diseño.ts";

export const listadoHistorias = [
    HistoriasBoton,
    HistoriasInput,
    HistoriasSelect,
    HistoriasDate,
    HistoriasCheckbox,
    HistoriasModal,
    HistoriasAcciones,
    HistoriasTextoEnriquecido,
    HistoriasMenuLateral,
    HistoriasSelectorColumnas,
    // HistoriasHome,
    // HistoriasClientes,
] as unknown as HistoriasComponente[];
