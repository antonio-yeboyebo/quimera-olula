import { Direccion } from "../../comun/diseño.ts";
import {
    makeValidador,
    MetaObjetoValor,
    stringNoVacio
} from "../../comun/dominio.ts";
import { NuevoPresupuesto, Presupuesto } from "./diseño.ts";

export const direccionVacia = (): Direccion => ({
    nombre_via: "",
    tipo_via: "",
    numero: "",
    otros: "",
    cod_postal: "",
    ciudad: "",
    provincia_id: 0,
    provincia: "",
    pais_id: "",
    apartado: "",
    telefono: "",
});

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

export const presupuestoNuevoVacio = (): NuevoPresupuesto => ({
    cliente_id: "",
    direccion_id: "",
    empresa_id: "1",
});

export const validadoresPresupuesto = {
    cliente_id: (valor: string) => stringNoVacio(valor),
    direccion_id: (valor: string) => stringNoVacio(valor),
    empresa_id: (valor: string) => stringNoVacio(valor),
};

export const metaNuevoPresupuesto: MetaObjetoValor<NuevoPresupuesto> = {
    bloqueados: [],
    requeridos: ["cliente_id", "direccion_id", "empresa_id"],
    validador: makeValidador({}),
};


