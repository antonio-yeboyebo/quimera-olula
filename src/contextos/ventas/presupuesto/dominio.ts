import { Evento } from "../../../componentes/eventos/pubsub.ts";
import { Direccion } from "../../comun/diseño.ts";
import { EventoLineaBorrada, EventoLineaCreada, EventoReferenciaLineaCambiada, LineaPresupuesto, NuevoPresupuesto, Presupuesto } from "./diseño.ts";

export const direccionVacia = (): Direccion => ({
    dir_envio: false,
    dir_facturacion: false,
    nombre_via: '',
    tipo_via: '',
    numero: '',
    otros: '',
    cod_postal: '',
    ciudad: '',
    provincia_id: 0,
    provincia: '',
    pais_id: '',
    apartado: '',
    telefono: '',
})


export const presupuestoVacio = (): Presupuesto => ({
    id: '',
    codigo: '',
    fecha: '',
    cliente_id: '',
    nombre_cliente: '',
    id_fiscal: '',
    direccion_id: '',
    direccion: direccionVacia(),
    agente_id: '',
    nombre_agente: '',
    divisa_id: '',
    aprobado: false,
})

export const validadoresPresupuesto = {
    cliente_id: (valor: string) => valor.trim() !== "",
    direccion_id: (valor: string) => valor.trim() !== "",
    fecha: (valor: string) => !isNaN(Date.parse(valor)),
    empresa_id: (valor: string) => valor.trim() !== "",
    nuevoPresupuesto: (presupuesto: NuevoPresupuesto) =>
        validadoresPresupuesto.cliente_id(presupuesto.cliente_id) &&
        validadoresPresupuesto.direccion_id(presupuesto.direccion_id) &&
        validadoresPresupuesto.empresa_id(presupuesto.empresa_id),
};


export const REFERENCIA_LINEA_CAMBIADA = 'ventas.presupuesto.linea.referencia_cambiada'
export const eventoReferenciaLineaCambiada = (linea: LineaPresupuesto, referencia: string): EventoReferenciaLineaCambiada => ({
    id: CANTIDAD_LINEA_CAMBIADA,
    payload: { linea, referencia, }
})

export const LINEA_BORRADA = 'ventas.presupuesto.linea.borrada'
export const eventoLineaBorrada = (linea: LineaPresupuesto): EventoLineaBorrada => ({
    id: LINEA_BORRADA,
    payload: { linea, }
})

export const LINEA_CREADA = 'ventas.presupuesto.linea.creada'
export const eventoLineaCreada = (lineaId: string): EventoLineaCreada => ({
    id: LINEA_CREADA,
    payload: { lineaId }
})

export const CABECERA_CAMBIADA = 'ventas.presupuesto.cabecera.cambiada'
export enum CambioCabecera { GENERICO, CLIENTE }
export const eventoCabeceraCambiada = (presupuesto: Presupuesto, cambio = CambioCabecera.GENERICO): Evento => ({
    id: CABECERA_CAMBIADA,
    payload: { presupuesto, cambio }
})