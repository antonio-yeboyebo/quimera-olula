import { fechaIso, textoTipoTarea } from "../comun/dominio.ts";
import { FormularioTarea, Motivo, NuevaTareaAPI, Sugerencia } from "./diseño.ts";

export const MAX_NOTA = 1000;
export const AFINIDAD_SUGERENCIA = 0.7;

export const formularioVacio = (ahora: Date = new Date()): FormularioTarea => ({
    cliente: null,
    idTrato: null,
    tipo: "Cita",
    fecha: fechaIso(ahora),
    hora: `${String(ahora.getHours()).padStart(2, "0")}:00`,
    idMotivo: null,
    producto: null,
    nota: "",
});

export const erroresFormulario = (formulario: FormularioTarea): string[] =>
    [
        !formulario.cliente && "Elige un cliente",
        !formulario.fecha && "Indica la fecha",
        !formulario.hora && "Indica la hora",
        formulario.nota.length > MAX_NOTA && `La nota no puede pasar de ${MAX_NOTA} caracteres`,
    ].filter((error): error is string => !!error);

export const tituloTarea = (formulario: FormularioTarea, motivos: Motivo[]): string => {
    const motivo = motivos.find((m) => m.id === formulario.idMotivo)?.descripcion;
    return [textoTipoTarea[formulario.tipo], formulario.cliente?.nombre, motivo]
        .filter(Boolean)
        .join(" · ")
        .slice(0, 100);
};

export const tareaParaAPI = (formulario: FormularioTarea, motivos: Motivo[]): NuevaTareaAPI => {
    const producto = formulario.producto;
    return {
        titulo: tituloTarea(formulario, motivos),
        fecha: formulario.fecha,
        hora: formulario.hora.length === 5 ? `${formulario.hora}:00` : formulario.hora,
        tipo: formulario.tipo,
        nota: formulario.nota,
        idmotivo: formulario.idMotivo ? Number(formulario.idMotivo) : null,
        referencia: producto?.tipo === "articulo" ? producto.codigo : null,
        codfamilia: producto?.tipo === "familia" ? producto.codigo : null,
        codsubfamilia: producto?.tipo === "subfamilia" ? producto.codigo : null,
    };
};

export const sugerenciasVisibles = (sugerencias: Sugerencia[], todas: boolean): Sugerencia[] =>
    todas ? sugerencias : sugerencias.filter((s) => s.score > AFINIDAD_SUGERENCIA);
