import ApiUrls from "#/tesoreria/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosFormaPago,
    DeleteFormaPago,
    FormaPago,
    GetFormaPago,
    GetFormasPago,
    NuevaFormaPago,
    PatchFormaPago,
    PlazoFormaPago,
    PostFormaPago,
} from "./diseño.ts";
import { tTesoreria } from "../i18n/index.ts";

const baseUrl = new ApiUrls().FORMA_PAGO;

const urlFormaPago = (id: string) => `${baseUrl}/${encodeURIComponent(id)}`;

export interface FormaPagoApi {
    id: string;
    descripcion: string | null;
    genera_recibos: string | null;
    cuenta_id: string | null;
    descripcion_cuenta: string | null;
    domiciliado: boolean | null;
    tipo_pago_facturae: string | null;
    plazos?: { dias: number; aplazado: number }[];
}

export const formaPagoDesdeApi = (api: FormaPagoApi): FormaPago => ({
    id: api.id,
    descripcion: api.descripcion ?? "",
    generaRecibos: api.genera_recibos ?? "Emitidos",
    cuentaId: api.cuenta_id ?? "",
    descripcionCuenta: api.descripcion_cuenta ?? "",
    domiciliado: !!api.domiciliado,
    tipoPagoFacturae: api.tipo_pago_facturae ?? "",
    plazos: (api.plazos ?? []).map((p) => ({ dias: Number(p.dias), aplazado: Number(p.aplazado) })),
});

const plazosAApi = (plazos: PlazoFormaPago[]) =>
    plazos.map((p) => ({ dias: Number(p.dias), aplazado: Number(p.aplazado) }));

const textoONull = (valor: string) => valor.trim() || null;

export const cambiosFormaPagoAApi = (cambios: CambiosFormaPago) => {
    const api: Record<string, unknown> = {};
    if (cambios.descripcion !== undefined) api.descripcion = textoONull(cambios.descripcion);
    if (cambios.generaRecibos !== undefined) api.genera_recibos = cambios.generaRecibos;
    if (cambios.cuentaId !== undefined) api.cuenta_id = textoONull(cambios.cuentaId);
    if (cambios.domiciliado !== undefined) api.domiciliado = cambios.domiciliado;
    if (cambios.tipoPagoFacturae !== undefined) api.tipo_pago_facturae = textoONull(cambios.tipoPagoFacturae);
    if (cambios.plazos !== undefined) api.plazos = plazosAApi(cambios.plazos);
    return api;
};

export const nuevaFormaPagoAApi = (nueva: NuevaFormaPago) => {
    const { id, ...resto } = nueva;
    return { id: id.trim(), ...cambiosFormaPagoAApi(resto) };
};

export const getFormasPago: GetFormasPago = async (criteria) =>
    RestAPI.getQuery<FormaPago, FormaPagoApi>(baseUrl, criteria, formaPagoDesdeApi);

export const getFormaPago: GetFormaPago = async (id) =>
    RestAPI.getItem<FormaPago, FormaPagoApi>(urlFormaPago(id), formaPagoDesdeApi);

export const postFormaPago: PostFormaPago = async (nueva) => {
    const respuesta = await RestAPI.post(
        baseUrl, nuevaFormaPagoAApi(nueva), tTesoreria("forma_pago.errorAlCrearLaFormaDe")
    );
    return String(respuesta.id);
};

export const patchFormaPago: PatchFormaPago = async (id, cambios) => {
    await RestAPI.patch(
        urlFormaPago(id), cambiosFormaPagoAApi(cambios), tTesoreria("forma_pago.errorAlGuardarLaFormaDe")
    );
};

export const deleteFormaPago: DeleteFormaPago = async (id) => {
    await RestAPI.delete(urlFormaPago(id), tTesoreria("forma_pago.errorAlBorrarLaFormaDe"));
};
