import albaranes from "@quimera-extension/base-albaranes";
import facturas from "@quimera-extension/base-facturas";
import ventas from "@quimera-extension/base-ventas";
import core from "@quimera-extension/core";

import AppMenu from "./static/appmenu";
import schemas from "./static/schemas";
import * as AlbaranCli from "./views/AlbaranCli";
import * as AlbaranesCli from "./views/AlbaranesCli";
import * as AlbaranesMaster from "./views/AlbaranesCli/AlbaranesMaster";
import * as AlbaranesCliNuevo from "./views/AlbaranesCliNuevo";
import * as EnviarAlbaranFirmaExterna from "./views/EnviarAlbaranFirmaExterna"
import * as EnviarDocumentoEmail from "./views/EnviarDocumentoEmail";
import * as CajaEnvio from "./views/EnviarDocumentoEmail/CajaEnvio";
import * as EmailsDisponibles from "./views/EnviarDocumentoEmail/EmailsDisponibles";
import * as FacturaCli from "./views/FacturaCli";
import * as FacturasCli from "./views/FacturasCli";
import * as FacturasMaster from "./views/FacturasCli/FacturasMaster";
import * as FacturasCliNueva from "./views/FacturasCliNueva";
import * as Home from "./views/Home";
import * as LineaAlbaranCli from "./views/LineaAlbaranCli";
import * as LineaAlbaranCliNueva from "./views/LineaAlbaranCliNueva";
import * as LineaFacturaCli from "./views/LineaFacturaCli";
import * as LineaFacturaCliNueva from "./views/LineaFacturaCliNueva";
import * as LineaPedidoCli from "./views/LineaPedidoCli";
import * as LineaPedidoCliNueva from "./views/LineaPedidoCliNueva";
import * as LineaPresupuestoCliNueva from "./views/LineaPresupuestoCliNueva";
import * as PedidoCli from "./views/PedidoCli";
import * as PedidosCli from "./views/PedidosCli";
import * as PedidosMaster from "./views/PedidosCli/PedidosMaster";
import * as PedidosCliNuevo from "./views/PedidosCliNuevo";
import * as PresupuestoCli from "./views/PresupuestoCli";
import * as PresupuestosCliMaster from "./views/PresupuestosCli/Master";
import * as PresupuestoCliNuevo from "./views/PresupuestoCliNuevo";

export default {
  path: "extensions/tienda_vbarba",
  views: {
    AlbaranCli,
    AlbaranesCli,
    AlbaranesCliNuevo,
    EnviarAlbaranFirmaExterna,
    EnviarDocumentoEmail,
    FacturasCli,
    FacturaCli,
    FacturasCliNueva,
    Home,
    LineaAlbaranCli,
    LineaAlbaranCliNueva,
    LineaFacturaCli,
    LineaFacturaCliNueva,
    LineaPedidoCli,
    LineaPedidoCliNueva,
    LineaPresupuestoCliNueva,
    PedidoCli,
    PedidosCli,
    PedidosCliNuevo,
    PresupuestoCli,
    PresupuestoCliNuevo,
  },
  subviews: {
    "PedidosCli/PedidosMaster": PedidosMaster,
    "AlbaranesCli/AlbaranesMaster": AlbaranesMaster,
    "FacturasCli/FacturasMaster": FacturasMaster,
    "EnviarDocumentoEmail/EmailsDisponibles": EmailsDisponibles,
    "EnviarDocumentoEmail/CajaEnvio": CajaEnvio,
    "PresupuestosCli/Master": PresupuestosCliMaster,
  },
  routes: {
    "/": { type: "view", view: "Home" },
  },
  dependencies: [core, ventas, albaranes, facturas],
  menus: {
    app: AppMenu,
  },
  rules: {
    "facturascli:visit": (check: (rule: string) => boolean) => check("facturascli"),
    "pedidoscli:visit": (check: (rule: string) => boolean) => check("pedidoscli"),
    "albaranescli:visit": (check: (rule: string) => boolean) => check("albaranescli"),
    "presupuestoscli:visit": (check: (rule: string) => boolean) => check("presupuestoscli"),
  },
  schemas,
};
