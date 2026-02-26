import albaranes from "@quimera-extension/base-albaranes";
import facturas from "@quimera-extension/base-facturas";
import firmasAlbaranes from "@quimera-extension/base-firma_albaranes";
import core from "@quimera-extension/core";

import AppMenu from "./static/appmenu";
import schemas from "./static/schemas";
import * as AlbaranesPuestoFirma from "./views/AlbaranesPuestoFirma";
import * as FiltroCabeceraAlbaranePuesto from "./views/AlbaranesPuestoFirma/CabeceraFiltro";
import * as ListadoAlbaranesMobilePuesto from "./views/AlbaranesPuestoFirma/ListadoMobile";
import * as AlbaranesVenta from "./views/AlbaranesVenta";
import * as FiltroCabeceraAlbaranes from "./views/AlbaranesVenta/CabeceraFiltro";
import * as ListadoAlbaranesMobile from "./views/AlbaranesVenta/ListadoMobile";
import * as FirmaAlbaran from "./views/FirmaAlbaran";
import * as FirmaAlbaranPuesto from "./views/FirmaAlbaranPuesto";
import * as Footer from "./views/Footer";
import * as Home from "./views/Home";
import * as PuestoFirma from "./views/PuestoFirma";

export default {
  path: "extensions/vbarba/firma_albaranes",
  views: {
    Home,
    Footer,
    AlbaranesVenta,
    FirmaAlbaran,
    AlbaranesPuestoFirma,
    FirmaAlbaranPuesto,
    PuestoFirma,
  },
  subviews: {
    "AlbaranesVenta/CabeceraFiltro": FiltroCabeceraAlbaranes,
    "AlbaranesVenta/ListadoMobile": ListadoAlbaranesMobile,
    "AlbaranesPuestoFirma/CabeceraFiltro": FiltroCabeceraAlbaranePuesto,
    "AlbaranesPuestoFirma/ListadoMobile": ListadoAlbaranesMobilePuesto,
  },
  routes: {
    "/": { type: "view", view: "Home" },
    "/albaranesPuesto": { type: "view", view: "AlbaranesPuestoFirma" },
    "/puestoFirma": { type: "view", view: "PuestoFirma" },
  },
  dependencies: [core, albaranes, facturas, firmasAlbaranes],
  menus: {
    app: AppMenu,
  },
  rules: {
    "albaranescli:firmaalbaranes": (check: (rule: string) => boolean) =>
      check("albaranescli/firmaalbaranes"),
    "albaranescli:firmapuesto": (check: (rule: string) => boolean) =>
      check("albaranescli/firmapuesto"),
  },
  schemas,
};
