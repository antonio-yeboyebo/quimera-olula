import { crearRouterLegacy, Dependency } from "@olula/lib/router_legacy.ts";
import Quimera from "quimera";
import "../../../legacy/apps/monterelax/styles/_variables.scss";
import project from "../../../legacy/apps/tienda-nativa-mon/src/project.ts";

const environment = {
  production: import.meta.env.MODE !== "development",
  getCurrentTitle: () => import.meta.env.VITE_APP_TITLE,
  inDevelopment: () => import.meta.env.MODE === "development",
  getAPIUrl: () =>
    import.meta.env.VITE_LEGACY_API_URL || "http://127.0.0.1:8006/api/",
  getUrlDict: () => JSON.parse(import.meta.env.VITE_URL_DICT ?? "{}"),
  getToken: () => {
    const tk = localStorage.getItem("token-refresco");
    return tk ? `Token ${tk}` : false;
  },
  getUrlImages: () => import.meta.env.VITE_URL_IMAGES,
  renderHeader: false,
  loginType: "clientes",
};

const LegacyAppComp = (
  <Quimera.App project={project} environment={environment} />
);

export const routerLegacy = crearRouterLegacy(
  project as Dependency,
  LegacyAppComp
);
