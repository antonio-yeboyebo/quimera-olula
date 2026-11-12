import { UsuarioSmartsales } from "../comun/diseño.ts";
import { Contacto, ContactoAPI } from "./diseño.ts";
import {
    accesoCompleto,
    altaParaAPI,
    contactoDesdeAPI,
    edicionParaAPI,
    erroresAlta,
    esMarketing,
    formularioEdicion,
    formularioVacio,
    visiblesPara,
} from "./dominio.ts";

const usuario = (datos: Partial<UsuarioSmartsales> = {}): UsuarioSmartsales => ({
    agente: "A1",
    superusuario: false,
    tipoTratoFarma: null,
    tipoTratoVentaProducto: null,
    grupo: "Comerciales",
    empresa: 1,
    ...datos,
});

const contactoAPI = (datos: Partial<ContactoAPI> = {}): ContactoAPI => ({
    codcontacto: "000010",
    nombre: "Ana",
    email: "ana@clinica.es",
    telefono1: "600000000",
    direccion: "Calle Mayor 1",
    ciudad: "Sevilla",
    codpostal: "41001",
    codcliente: "000123",
    enlista: "5",
    datosrevisados: false,
    ...datos,
});

const contacto = (datos: Partial<ContactoAPI> = {}): Contacto => contactoDesdeAPI(contactoAPI(datos));

describe("acceso al contacto", () => {
    test("marketing y superusuarios ven todos los contactos", () => {
        expect(esMarketing(usuario({ grupo: "MKT" }))).toBe(true);
        expect(esMarketing(usuario({ grupo: "Responsable de marketing" }))).toBe(true);
        expect(esMarketing(usuario({ superusuario: true }))).toBe(true);
        expect(esMarketing(usuario())).toBe(false);
    });

    test("un comercial solo tiene acceso completo si el contacto está en su lista", () => {
        expect(accesoCompleto(contacto(), usuario())).toBe(true);
        expect(accesoCompleto(contacto({ enlista: null }), usuario())).toBe(false);
        expect(accesoCompleto(contacto({ enlista: false }), usuario({ grupo: "MKT" }))).toBe(true);
    });

    test("un comercial solo ve sus tratos y tareas", () => {
        const elementos = [{ codAgente: "A1" }, { codAgente: "A2" }];
        expect(visiblesPara(elementos, usuario())).toEqual([{ codAgente: "A1" }]);
        expect(visiblesPara(elementos, usuario({ superusuario: true }))).toEqual(elementos);
    });
});

describe("alta de contacto", () => {
    test("exige nombre y un e-mail válido", () => {
        expect(erroresAlta(formularioVacio())).toEqual(["Indica el nombre", "Indica el e-mail"]);
        expect(erroresAlta({ ...formularioVacio(), nombre: "Ana", email: "ana@" })).toEqual(["Formato de e-mail no válido"]);
        expect(erroresAlta({ ...formularioVacio(), nombre: "Ana", email: "ana@clinica.es" })).toEqual([]);
    });

    test("manda la empresa del usuario y los vacíos como nulos", () => {
        expect(
            altaParaAPI(
                { ...formularioVacio(), nombre: " Ana ", email: "ana@clinica.es", cliente: { codigo: "000123", nombre: "Clínica" } },
                1
            )
        ).toEqual({
            nombre: "Ana",
            email: "ana@clinica.es",
            telefono1: null,
            direccion: null,
            codpostal: null,
            codcliente: "000123",
            idcompany: 1,
            datosrevisados: false,
        });
    });
});

describe("edición de contacto", () => {
    test("solo manda los campos que cambian", () => {
        const actual = contacto();
        const formulario = { ...formularioEdicion(actual, "Clínica"), telefono: "611111111" };
        expect(edicionParaAPI(actual, formulario)).toEqual({ telefono1: "611111111" });
    });

    test("quitar el cliente manda codcliente nulo", () => {
        const actual = contacto();
        expect(edicionParaAPI(actual, { ...formularioEdicion(actual, "Clínica"), cliente: null })).toEqual({ codcliente: null });
    });
});
