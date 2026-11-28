import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import { GetMandato, GetMandatos, Mandato } from "./diseño.js";
import { tTesoreria } from "../i18n/index.ts";

export interface MandatoApi {
    id: string;
    referencia: string;
    descripcion: string;
    cliente_id: string;
    cuenta_id: string;
    cuenta_cliente_id: string;
    tipo: string;
    tipo_pago: string;
    num_efectos: number;
    fecha_firma: string | null;
    lugar_firma: string;
    fecha_ultimo_adeudo: string | null;
    fecha_caducidad: string | null;
}

const baseUrl = new ApiUrls().MANDATO;

export const mandatoDesdeApi = (api: MandatoApi): Mandato => ({
    id: api.id,
    referencia: api.referencia,
    descripcion: api.descripcion,
    clienteId: api.cliente_id,
    cuentaId: api.cuenta_id,
    cuentaClienteId: api.cuenta_cliente_id,
    tipo: api.tipo,
    tipoPago: api.tipo_pago,
    numEfectos: api.num_efectos,
    fechaFirma: fechaDesdeApi(api.fecha_firma),
    lugarFirma: api.lugar_firma,
    fechaUltimoAdeudo: fechaDesdeApi(api.fecha_ultimo_adeudo),
    fechaCaducidad: fechaDesdeApi(api.fecha_caducidad),
});

export const getMandato: GetMandato = async (id) => {
    return await RestAPI.getItem<Mandato, MandatoApi>(
        `${baseUrl}/${id}`,
        mandatoDesdeApi,
        tTesoreria("mandato.errorAlObtenerElMandato")
    );
};

export const getMandatos: GetMandatos = async (criteria) => {
    return await RestAPI.getQuery<Mandato, MandatoApi>(
        baseUrl,
        criteria,
        mandatoDesdeApi,
        tTesoreria("mandato.errorAlObtenerLosMandatos")
    );
};
