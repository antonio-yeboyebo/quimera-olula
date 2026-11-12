import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Presentacion } from "../cubo/diseño.ts";
import { peticionApi, PeticionPivotApi, peticionDesdeApi } from "../cubo/infraestructura.ts";
import AnalisisUrls from "../comun/urls.ts";
import { BorrarVista, CambiarVista, CrearVista, GetVista, GetVistas, ResumenVista, Vista } from "./diseño.ts";

const baseUrl = new AnalisisUrls().VISTA;

type ResumenVistaApi = {
    id: string;
    nombre: string;
    cubo_id: string;
    actualizado_en: string;
};

type VistaApi = ResumenVistaApi & {
    peticion: PeticionPivotApi;
    presentacion: Partial<Presentacion>;
};

const resumenDesdeApi = (v: ResumenVistaApi): ResumenVista => ({
    id: v.id,
    nombre: v.nombre,
    cuboId: v.cubo_id,
    actualizadoEn: new Date(v.actualizado_en),
});

const vistaDesdeApi = (v: VistaApi): Vista => ({
    ...resumenDesdeApi(v),
    peticion: peticionDesdeApi(v.peticion),
    presentacion: v.presentacion,
});

export const getVistas: GetVistas = async (cuboId) => {
    const query = cuboId ? `?cubo=${encodeURIComponent(cuboId)}` : "";
    const respuesta = await RestAPI.get<{ datos: ResumenVistaApi[] }>(`${baseUrl}${query}`);
    return respuesta.datos.map(resumenDesdeApi);
};

export const getVista: GetVista = async (id) => {
    const respuesta = await RestAPI.get<{ datos: VistaApi }>(`${baseUrl}/${id}`);
    return vistaDesdeApi(respuesta.datos);
};

export const crearVista: CrearVista = async (vista) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            cubo_id: vista.cuboId,
            nombre: vista.nombre,
            peticion: peticionApi(vista.peticion),
            presentacion: vista.presentacion,
        },
        "Error al guardar la vista"
    );
    return String(respuesta.id);
};

export const cambiarVista: CambiarVista = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        {
            ...(cambios.nombre !== undefined && { nombre: cambios.nombre }),
            ...(cambios.peticion && { peticion: peticionApi(cambios.peticion) }),
            ...(cambios.presentacion && { presentacion: cambios.presentacion }),
        },
        "Error al guardar la vista"
    );
};

export const borrarVista: BorrarVista = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar la vista");
};
