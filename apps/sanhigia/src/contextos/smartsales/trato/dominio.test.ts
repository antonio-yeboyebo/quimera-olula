import { TratoDetalle, TratoDetalleAPI } from "./diseño.ts";
import {
    accionGanar,
    cambioEstado,
    documentoParaAPI,
    edicionParaAPI,
    erroresDocumento,
    puedeAsociarPedido,
    puedeBorrar,
    puedeCrearPresupuesto,
    puedePerder,
    textoBotonGanar,
    textoConfirmarBorrado,
    tratoDesdeAPI,
} from "./dominio.ts";

const FARMA = "7";

const tratoAPI = (datos: Partial<TratoDetalleAPI> = {}): TratoDetalleAPI => ({
    idtrato: 40,
    titulo: "Trato",
    valor: 100,
    estado: "-",
    idtipotrato: 3,
    tipotrato: "Venta",
    fecha: "2026-10-01",
    horaalta: "10:30:00",
    codcliente: "000123",
    nombrecliente: "Clínica",
    codcontacto: null,
    nombrecontacto: null,
    codagente: "A1",
    idcampania: null,
    descripcionperdida: null,
    idpresupuesto: null,
    codpresupuesto: null,
    idpedido: null,
    codpedido: null,
    exigirgenerarpedido: false,
    idlicencia: null,
    familias: null,
    ...datos,
});

const trato = (datos: Partial<TratoDetalleAPI> = {}): TratoDetalle => tratoDesdeAPI(tratoAPI(datos));

describe("tratoDesdeAPI", () => {
    test("lee las familias guardadas como en legacy", () => {
        const familias = '{"codfamilia":"BIO","descripcion":"Biomateriales"};{"codfamilia":"IMP","descripcion":"Implantes"}';
        expect(trato({ familias }).familias).toEqual([
            { codfamilia: "BIO", descripcion: "Biomateriales" },
            { codfamilia: "IMP", descripcion: "Implantes" },
        ]);
    });

    test("trata un estado vacío como abierto", () => {
        expect(trato({ estado: null }).estado).toBe("-");
    });
});

describe("accionGanar", () => {
    test("un trato farma pide los datos de la licencia", () => {
        expect(accionGanar(trato({ idtipotrato: 7 }), FARMA)).toBe("licencia");
    });

    test("si el tipo exige pedido y hay presupuesto, se aprueba", () => {
        expect(accionGanar(trato({ exigirgenerarpedido: true, idpresupuesto: 5 }), FARMA)).toBe("aprobar_presupuesto");
    });

    test("si el tipo exige pedido y no hay presupuesto, se crea el pedido", () => {
        expect(accionGanar(trato({ exigirgenerarpedido: true }), FARMA)).toBe("crear_pedido");
    });

    test("en el resto de casos se gana directamente", () => {
        expect(accionGanar(trato(), FARMA)).toBe("ganar");
    });
});

describe("textoBotonGanar", () => {
    test("muestra la acción pendiente o Ganado si ya lo está", () => {
        expect(textoBotonGanar(trato({ exigirgenerarpedido: true }), FARMA)).toBe("Crear pedido");
        expect(textoBotonGanar(trato({ exigirgenerarpedido: true, idpresupuesto: 5 }), FARMA)).toBe("Aprobar presupuesto");
        expect(textoBotonGanar(trato({ exigirgenerarpedido: true, estado: "Ganado" }), FARMA)).toBe("Ganado");
    });
});

describe("botones del trato", () => {
    test("no se puede perder con pedido o licencia", () => {
        expect(puedePerder(trato({ idpedido: 1 }))).toBe(false);
        expect(puedePerder(trato({ idlicencia: 1 }))).toBe(false);
        expect(puedePerder(trato())).toBe(true);
    });

    test("crear presupuesto solo sin documentos y sin perder", () => {
        expect(puedeCrearPresupuesto(trato())).toBe(true);
        expect(puedeCrearPresupuesto(trato({ idpresupuesto: 5 }))).toBe(false);
        expect(puedeCrearPresupuesto(trato({ estado: "Perdido" }))).toBe(false);
    });

    test("asociar pedido solo si el tipo lo exige y no hay documentos", () => {
        expect(puedeAsociarPedido(trato({ exigirgenerarpedido: true }))).toBe(true);
        expect(puedeAsociarPedido(trato())).toBe(false);
        expect(puedeAsociarPedido(trato({ exigirgenerarpedido: true, idpresupuesto: 5 }))).toBe(false);
    });
});

describe("puedeBorrar", () => {
    test("nunca un trato ganado", () => {
        expect(puedeBorrar(trato({ estado: "Ganado" }), "A1", FARMA, true)).toBe(false);
    });

    test("un trato farma solo su agente", () => {
        expect(puedeBorrar(trato({ idtipotrato: 7 }), "A2", FARMA, true)).toBe(false);
        expect(puedeBorrar(trato({ idtipotrato: 7 }), "A1", FARMA, false)).toBe(true);
    });

    test("el resto su agente o quien tenga permiso", () => {
        expect(puedeBorrar(trato(), "A2", FARMA, false)).toBe(false);
        expect(puedeBorrar(trato(), "A2", FARMA, true)).toBe(true);
    });
});

test("textoConfirmarBorrado avisa de lo que se borra con el trato", () => {
    expect(textoConfirmarBorrado(true, true)).toBe("El trato se eliminará definitivamente, así como las tareas y el presupuesto.");
    expect(textoConfirmarBorrado(false, false)).toBe("El trato se eliminará definitivamente.");
});

test("cambioEstado solo guarda la causa si se pierde", () => {
    expect(cambioEstado("Perdido", "3")).toEqual({ estado: "Perdido", idperdida: 3 });
    expect(cambioEstado("Ganado", "3")).toEqual({ estado: "Ganado", idperdida: null });
});

test("edicionParaAPI recorta el título y guarda las familias como en legacy", () => {
    expect(
        edicionParaAPI({
            titulo: "  Nuevo  ",
            valor: 50,
            idTipoTrato: "3",
            codContacto: null,
            familias: [{ codfamilia: "BIO", descripcion: "Biomateriales" }],
        })
    ).toEqual({
        titulo: "Nuevo",
        valor: 50,
        idtipotrato: 3,
        codcontacto: null,
        familias: '{"codfamilia":"BIO","descripcion":"Biomateriales"}',
    });
});

describe("documentos del trato", () => {
    test("la dirección solo es obligatoria si el cliente no tiene una automática", () => {
        const datos = { codDireccion: null, regimenIva: null, codEvento: "ventaregular" };
        expect(erroresDocumento(datos, false)).toEqual([]);
        expect(erroresDocumento(datos, true)).toEqual(["Elige la dirección de envío"]);
    });

    test("el presupuesto manda el evento en sh_codevento y el pedido como borrador", () => {
        const datos = { codDireccion: "9", regimenIva: null, codEvento: "C1" };
        expect(documentoParaAPI("presupuesto", trato(), datos, "2026-10-28")).toMatchObject({ idtrato: 40, sh_codevento: "C1" });
        expect(documentoParaAPI("pedido", trato(), datos, "2026-10-28")).toMatchObject({
            codevento: "C1",
            fechasalida: "2026-10-28",
            sh_ctrlestadoborr: true,
        });
    });
});
