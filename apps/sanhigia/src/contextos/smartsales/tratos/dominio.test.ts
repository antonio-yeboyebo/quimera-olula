import { FiltrosTratos, FormularioTrato, TratoListaAPI } from "./diseño.ts";
import { erroresTrato, filtroTratos, origenTrato, totalesDesdeAPI, tratoParaAPI } from "./dominio.ts";

const trato = (datos: Partial<TratoListaAPI> = {}): TratoListaAPI => ({
    idtrato: 1,
    titulo: "Trato",
    nombrecliente: null,
    nombrecontacto: null,
    valor: 0,
    estado: "-",
    fecha: null,
    idcampania: null,
    idtipotrato: 3,
    cuentamarketing: null,
    ...datos,
});

const filtrosVacios: FiltrosTratos = {
    agente: null,
    estado: "todos",
    titulo: "",
    contacto: "",
    codCliente: "",
    cifNif: "",
    desde: "",
    hasta: "",
};

describe("origenTrato", () => {
    test("farma por tipo, campaña del comercial o de marketing por cuenta", () => {
        expect(origenTrato(trato({ idtipotrato: 9 }), "9")).toBe("farma");
        expect(origenTrato(trato({ idcampania: 5, cuentamarketing: "sanhigia" }), "9")).toBe("mkt");
        expect(origenTrato(trato({ idcampania: 5, cuentamarketing: "comercial" }), "9")).toBe("campaña");
        expect(origenTrato(trato(), "9")).toBeNull();
    });
});

describe("filtroTratos", () => {
    test("sin filtros no manda nada", () => {
        expect(filtroTratos(filtrosVacios)).toBeUndefined();
    });

    test("el agente incluye los tratos en los que es observador", () => {
        expect(filtroTratos({ ...filtrosVacios, agente: "A1", estado: "abiertos" })).toEqual({
            and: [{ or: [["codagente", "eq", "A1"], ["codagenteobservador", "eq", "A1"]] }, ["estado", "eq", "-"]],
        });
    });

    test("los contadores se piden sin el filtro de estado", () => {
        expect(filtroTratos({ ...filtrosVacios, estado: "ganados" }, false)).toBeUndefined();
    });
});

describe("totales", () => {
    test("abiertos es el total menos ganados y perdidos", () => {
        expect(totalesDesdeAPI({ total: 10, ganados: 3, perdidos: 2 })).toEqual({ abiertos: 5, ganados: 3, perdidos: 2 });
    });
});

describe("alta de trato", () => {
    const formulario: FormularioTrato = {
        titulo: " PTE para Clínica ",
        cliente: { codigo: "000123", nombre: "Clínica" },
        idTipoTrato: "4",
        valor: 0,
        familias: [{ codfamilia: "BIO", descripcion: "Biomateriales" }],
        producto: { tipo: "subfamilia", codigo: "PTE", descripcion: "PTE" },
    };

    test("valida título, cliente y tipo", () => {
        expect(erroresTrato(formulario)).toEqual([]);
        expect(erroresTrato({ ...formulario, titulo: "", cliente: null, idTipoTrato: null })).toHaveLength(3);
    });

    test("manda las familias como en legacy y el producto en su campo", () => {
        expect(tratoParaAPI(formulario)).toEqual({
            titulo: "PTE para Clínica",
            codcliente: "000123",
            idtipotrato: 4,
            valor: 0,
            familias: '{"codfamilia":"BIO","descripcion":"Biomateriales"}',
            referencia: null,
            codfamilia: null,
            codsubfamilia: "PTE",
        });
    });
});
