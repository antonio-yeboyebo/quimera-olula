import { UsuarioSmartsales } from "../comun/diseño.ts";
import { CambiosContactoAPI, Contacto, ContactoAPI, FormularioContacto } from "./diseño.ts";

const GRUPOS_MARKETING = ["MKT", "Responsable de marketing"];

const PATRON_EMAIL = /^(?!\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}$/;

const nulo = (texto: string) => texto.trim() || null;

export const contactoDesdeAPI = (contacto: ContactoAPI): Contacto => ({
    codigo: contacto.codcontacto,
    nombre: contacto.nombre,
    email: contacto.email,
    telefono: contacto.telefono1,
    direccion: contacto.direccion,
    ciudad: contacto.ciudad ?? null,
    codPostal: contacto.codpostal,
    codCliente: contacto.codcliente || null,
    enLista: !!contacto.enlista,
    datosRevisados: !!contacto.datosrevisados,
});

export const esMarketing = (usuario: UsuarioSmartsales | null) =>
    !!usuario && (usuario.superusuario || GRUPOS_MARKETING.includes(usuario.grupo ?? ""));

export const accesoCompleto = (contacto: Contacto, usuario: UsuarioSmartsales | null) => contacto.enLista || esMarketing(usuario);

export const visiblesPara = <T extends { codAgente: string | null }>(elementos: T[], usuario: UsuarioSmartsales | null) =>
    esMarketing(usuario) ? elementos : elementos.filter((e) => !!usuario?.agente && e.codAgente === usuario.agente);

export const emailValido = (email: string) => PATRON_EMAIL.test(email.trim());

export const formularioVacio = (): FormularioContacto => ({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codPostal: "",
    cliente: null,
});

export const formularioEdicion = (contacto: Contacto, nombreCliente: string | null): FormularioContacto => ({
    nombre: contacto.nombre,
    email: contacto.email ?? "",
    telefono: contacto.telefono ?? "",
    direccion: contacto.direccion ?? "",
    ciudad: contacto.ciudad ?? "",
    codPostal: contacto.codPostal ?? "",
    cliente: contacto.codCliente ? { codigo: contacto.codCliente, nombre: nombreCliente ?? contacto.codCliente } : null,
});

export const erroresAlta = (formulario: FormularioContacto) =>
    [
        !formulario.nombre.trim() && "Indica el nombre",
        !formulario.email.trim() && "Indica el e-mail",
        !!formulario.email.trim() && !emailValido(formulario.email) && "Formato de e-mail no válido",
    ].filter((e): e is string => !!e);

export const erroresEdicion = (formulario: FormularioContacto) =>
    [!formulario.nombre.trim() && "Indica el nombre"].filter((e): e is string => !!e);

export const altaParaAPI = (formulario: FormularioContacto, empresa: number | null): CambiosContactoAPI => ({
    nombre: formulario.nombre.trim(),
    email: formulario.email.trim(),
    telefono1: nulo(formulario.telefono),
    direccion: nulo(formulario.direccion),
    codpostal: nulo(formulario.codPostal),
    codcliente: formulario.cliente?.codigo ?? null,
    idcompany: empresa,
    datosrevisados: false,
});

export const edicionParaAPI = (contacto: Contacto, formulario: FormularioContacto): CambiosContactoAPI => {
    const nuevos: CambiosContactoAPI = {
        nombre: formulario.nombre.trim(),
        telefono1: nulo(formulario.telefono),
        direccion: nulo(formulario.direccion),
        ciudad: nulo(formulario.ciudad),
        codpostal: nulo(formulario.codPostal),
        codcliente: formulario.cliente?.codigo ?? null,
    };
    const actuales: CambiosContactoAPI = {
        nombre: contacto.nombre,
        telefono1: contacto.telefono,
        direccion: contacto.direccion,
        ciudad: contacto.ciudad,
        codpostal: contacto.codPostal,
        codcliente: contacto.codCliente,
    };
    return Object.fromEntries(
        Object.entries(nuevos).filter(([campo, valor]) => valor !== actuales[campo as keyof CambiosContactoAPI])
    ) as CambiosContactoAPI;
};
