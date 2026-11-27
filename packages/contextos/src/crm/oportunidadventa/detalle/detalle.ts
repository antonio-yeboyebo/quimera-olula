import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { OportunidadVenta } from "../diseño.ts";
import { getOportunidadVenta, patchOportunidadVenta } from "../infraestructura.ts";
import { ContextoDetalleOportunidad, EstadoDetalleOportunidad } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";

const onChangeOportunidad = (oportunidad: OportunidadVenta, campo: string, _: unknown, otros?: Record<string, unknown>) => {
    if (campo === "estado_id" && otros) {
        return {
            ...oportunidad,
            probabilidad: otros.probabilidad as number
        }
    }
    return oportunidad;
}

const tieneOrigen = (oportunidad: OportunidadVenta) => {
    return oportunidad.cliente_id || oportunidad.tarjeta_id || oportunidad.contacto_id
        ? true
        : tCrm("oportunidadventa.debeIndicarClienteTarjetaOContacto");
};

export const oportunidadVentaVacia: OportunidadVenta = {
    id: '',
    descripcion: '',
    cliente_id: null,
    nombre_cliente: null,
    importe: 0,
    estado_id: '',
    descripcion_estado: null,
    probabilidad: 0,
    fecha_cierre: null,
    contacto_id: null,
    nombre_contacto: null,
    tarjeta_id: null,
    nombre_tarjeta: null,
    usuario_id: null,
    observaciones: null,
    valor_defecto: false,
    agente_id: null,
};

export const metaOportunidadVenta: MetaModelo<OportunidadVenta> = {
    campos: {
        descripcion: { requerido: true, validacion: (oportunidad: OportunidadVenta) => stringNoVacio(oportunidad.descripcion) },
        importe: { requerido: true, tipo: "moneda" },
        probabilidad: { requerido: true, tipo: "numero" },
        fecha_cierre: { requerido: false, tipo: "fecha" },
        estado_id: { requerido: true, tipo: "selector" },
        cliente_id: { requerido: false, tipo: "autocompletar", validacion: tieneOrigen },
        tarjeta_id: { requerido: false, tipo: "autocompletar", validacion: tieneOrigen },
        nombre_cliente: { requerido: false },
    },
    onChange: onChangeOportunidad
};

type ProcesarOportunidad = ProcesarContexto<EstadoDetalleOportunidad, ContextoDetalleOportunidad>;

const pipeOportunidad = ejecutarListaProcesos<EstadoDetalleOportunidad, ContextoDetalleOportunidad>;

const conOportunidad = (oportunidad: OportunidadVenta) => (ctx: ContextoDetalleOportunidad) => ({ ...ctx, oportunidad });
const conEstado = (estado: EstadoDetalleOportunidad) => (ctx: ContextoDetalleOportunidad) => ({ ...ctx, estado });

const cargarOportunidad: (_: string) => ProcesarOportunidad = (id) =>
    async (contexto) => {
        const oportunidad = await getOportunidadVenta(id);

        return pipe(
            contexto,
            conOportunidad(oportunidad)
        )
    }

export const refrescarOportunidad: ProcesarOportunidad = async (contexto) => {
    const oportunidad = await getOportunidadVenta(contexto.oportunidad.id);

    return [
        pipe(
            contexto,
            conOportunidad({
                ...contexto.oportunidad,
                ...oportunidad
            })
        ),
        [["oportunidad_cambiada", oportunidad]]
    ]
}

export const cambiarOportunidad: ProcesarOportunidad = async (contexto, payload) => {
    const oportunidad = payload as OportunidadVenta;
    await patchOportunidadVenta(contexto.oportunidad.id, oportunidad)

    return pipeOportunidad(contexto, [
        refrescarOportunidad,
        "INICIAL",
    ]);
}

export const getContextoVacio: ProcesarOportunidad = async (contexto) => {
    return pipe(
        contexto,
        conEstado("INICIAL"),
        conOportunidad(oportunidadVentaVacia)
    )
}

export const cargarContexto: ProcesarOportunidad = async (contexto, payload) => {
    const id = payload as string;

    if (!id) return getContextoVacio(contexto);

    return pipeOportunidad(
        contexto,
        [cargarOportunidad(id)],
        payload
    );
}
