import { useTimerRefresco } from "#/auth/useTimerRefresco.ts";
import { rutasRegistroSaas } from "#/saas_registro/router_factory.ts";
import { InicioOlula, Vista } from "@olula/componentes/index.ts";
import { FactoryObj, FactoryProvider } from "@olula/lib/factory_ctx.tsx";
import { crearMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { crearWidgets, WidgetContextFactory } from "@olula/lib/widgets.ts";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { FactoryOlula } from "../../olula/src/factory.ts";
import { router } from "../../olula/src/router_factory.ts";
import { authMiddlewareSaas } from "./middlewares.ts";
import { usePersonalizacionTenant } from "./personalizacion.ts";

/**
 * Olula SaaS: el mismo ERP que apps/olula contra la API multi-empresa
 * (olula_servidor apps/olula_saas), más el registro público. Los módulos no
 * contratados se ocultan solos: whoami trae `saas.modulos_bloqueados` y `puede()`
 * los deniega (menú, pantallas y botones).
 */
const root = createRoot(document.getElementById("root")!);

const rutas = createBrowserRouter([
    ...rutasRegistroSaas,
    {
        path: "/",
        middleware: [authMiddlewareSaas],
        Component: Vista,
        children: router as RouteObject[],
    },
]);

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
    useTimerRefresco();
    usePersonalizacionTenant();

    useEffect(() => {
        const factory = new FactoryOlula();
        FactoryObj.setMenu(crearMenu(factory as unknown as Record<string, MenuContextFactory>));
        FactoryObj.setWidgets(crearWidgets(factory as unknown as Record<string, WidgetContextFactory>));
        FactoryObj.setApp(factory as unknown as Record<string, Record<string, unknown>>);
    }, []);

    return (
        <>
            <RouterProvider router={rutas} />
            <InicioOlula />
        </>
    );
};

root.render(
    <FactoryProvider>
        <App />
    </FactoryProvider>
);
