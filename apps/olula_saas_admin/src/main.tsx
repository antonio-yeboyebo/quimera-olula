import { authMiddleware } from "#/auth/middlewares.ts";
import { useTimerRefresco } from "#/auth/useTimerRefresco.ts";
import { InicioOlula, Vista } from "@olula/componentes/index.ts";
import { FactoryObj, FactoryProvider } from "@olula/lib/factory_ctx.tsx";
import { crearMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import FactorySaasAdmin from "./factory.ts";
import { router } from "./router_factory.ts";

const root = createRoot(document.getElementById("root")!);
const factory = new FactorySaasAdmin();
const appFactory = factory as unknown as Record<string, Record<string, unknown>>;
const menuFactory = crearMenu(factory as unknown as Record<string, MenuContextFactory>);

const rutas = createBrowserRouter([
    {
        path: "/",
        middleware: [authMiddleware],
        Component: Vista,
        children: router as RouteObject[],
    },
]);

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
    useTimerRefresco();

    useEffect(() => {
        FactoryObj.setMenu(menuFactory);
        FactoryObj.setApp(appFactory);
    }, []);

    return (
        <>
            <RouterProvider router={rutas} />
            <InicioOlula />
        </>
    );
};

root.render(
    <StrictMode>
        <FactoryProvider>
            <App />
        </FactoryProvider>
    </StrictMode>
);
