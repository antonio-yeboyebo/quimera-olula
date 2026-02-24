import ApiUrls from "#/ventas/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { MetaModelo } from "@olula/lib/dominio.js";

// DISEÑO

type FormCrearLinea = {
    idVariedad: string;
    variedad: string;
    idTipoPalet: string;
    cantidadEnvases: number;
    cantidadPalets: number;
    envasesPorPalet: number;
}

export type PostLineaNrj = (id: string, linea: FormCrearLinea) => Promise<string>;


// CONTROL

export const FormCrearLineaDefecto: FormCrearLinea = {
    idVariedad: "",
    variedad: "",
    idTipoPalet: "",
    cantidadEnvases: 0,
    cantidadPalets: 0,
    envasesPorPalet: 0
};

const onChange = (modelo: FormCrearLinea, campo: string, _: unknown, palet?: Record<string, unknown>) => {

    if (campo === "idTipoPalet" && palet) {
        const envasesPorPalet = palet.cantidadEnvase as number;
        return {
            ...modelo,
            envasesPorPalet,
            cantidadEnvases: modelo.cantidadPalets * envasesPorPalet
        }
    }
    if (campo === "cantidadPalets") {
        return {
            ...modelo,
            cantidadEnvases: modelo.cantidadPalets * modelo.envasesPorPalet
        }
    }
    return modelo;
}

export const metaCrearLinea: MetaModelo<FormCrearLinea> = {
    campos: {
        idVariedad: { tipo: "texto", requerido: true },
        idTipoPalet: { tipo: "texto", requerido: true },
        cantidadPalets: { tipo: "entero", requerido: true },
        cantidadEnvases: { tipo: "entero", requerido: true, positivo: true },
    },
    onChange
};

// INFRAESTRUCTURA

const baseUrl = new ApiUrls().PEDIDO;

export const postLineaNrj: PostLineaNrj = async (id, linea) => {

    return await RestAPI.post(
        `${baseUrl}/${id}/linea`,
        {
            lineas: [{
                variedad_id: linea.idVariedad,
                cantidad: linea.cantidadEnvases,
                tipo_palet_id: linea.idTipoPalet,
                cantidad_palets: linea.cantidadPalets
            }]
        },
        "Error al crear la linea de pedido"
    ).then((respuesta) => {
        const miRespuesta = respuesta as unknown as { ids: string[] };
        return miRespuesta.ids[0];
    });
}