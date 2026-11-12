import { modeloEsValido } from "@olula/lib/dominio.ts";
import { NuevoEnvioAgencia, OrdenAlmacen, TipoOrden } from "../diseño.ts";
import {
    albaranesSinEnvio,
    metaNuevoEnvioAgencia,
    nuevoEnvioAgenciaInicial,
    ordenPermiteEnvio,
    ordenVacia,
} from "../dominio.ts";
import { envioAgenciaAApi, ordenDesdeApi } from "../infraestructura.ts";

const orden = (tipo: TipoOrden, estado: string, albaranes: OrdenAlmacen["albaranes"]): OrdenAlmacen => ({
    ...ordenVacia(),
    id: "S00001",
    tipo,
    estado,
    albaranes,
});

const sinEnvio = { id: "1", codigo: "A1" };
const conEnvio = { id: "2", codigo: "A2", agenciaEnvio: "CEX", numeroTracking: "613000" };

describe("ordenPermiteEnvio", () => {
    test.each([
        ["SALIDA terminada con albarán sin envío", "SALIDA", "TERMINADA", [sinEnvio], true, true],
        ["sin agencias activas", "SALIDA", "TERMINADA", [sinEnvio], false, false],
        ["SALIDA preparada (sin albaranar)", "SALIDA", "PREPARADA", [sinEnvio], true, false],
        ["ENTRADA terminada", "ENTRADA", "TERMINADA", [sinEnvio], true, false],
        ["todos los albaranes ya enviados", "SALIDA", "TERMINADA", [conEnvio], true, false],
        ["sin albaranes", "SALIDA", "TERMINADA", [], true, false],
    ] as const)("%s", (_, tipo, estado, albaranes, hayAgencias, esperado) => {
        expect(ordenPermiteEnvio(orden(tipo, estado, [...albaranes]), hayAgencias)).toBe(esperado);
    });
});

describe("nuevoEnvioAgenciaInicial", () => {
    test("preselecciona el único albarán sin envío y la agencia si solo hay una", () => {
        const inicial = nuevoEnvioAgenciaInicial(
            orden("SALIDA", "TERMINADA", [sinEnvio, conEnvio]),
            [{ codigo: "DACHSER", nombre: "Dachser", servicios: [{ codigo: "Y", descripcion: "targoflex" }] }],
        );

        expect(inicial.albaranId).toBe("1");
        expect(inicial.agenciaId).toBe("DACHSER");
        expect(inicial.servicio).toBe("Y");
        expect(inicial.bultos).toBe(1);
    });

    test("con varias agencias no elige ninguna", () => {
        const inicial = nuevoEnvioAgenciaInicial(orden("SALIDA", "TERMINADA", [sinEnvio]), [
            { codigo: "DACHSER", nombre: "Dachser", servicios: [] },
            { codigo: "CEX", nombre: "Correos Express", servicios: [] },
        ]);

        expect(inicial.agenciaId).toBe("");
        expect(inicial.servicio).toBe("");
    });

    test("albaranesSinEnvio descarta los que ya tienen envío", () => {
        expect(albaranesSinEnvio(orden("SALIDA", "TERMINADA", [sinEnvio, conEnvio]))).toEqual([sinEnvio]);
    });
});

describe("metaNuevoEnvioAgencia", () => {
    const valido: NuevoEnvioAgencia = {
        albaranId: "1",
        agenciaId: "CEX",
        servicio: "PAQ24",
        bultos: 2,
        kilos: 12.5,
        fechaRecogida: new Date(),
        observaciones: "",
    };

    test("un envío completo es válido", () => {
        expect(modeloEsValido(metaNuevoEnvioAgencia)(valido)).toBe(true);
    });

    test.each([
        ["sin albarán", { albaranId: "" }],
        ["sin agencia", { agenciaId: "" }],
        ["sin servicio", { servicio: "" }],
        ["cero bultos", { bultos: 0 }],
        ["bultos con decimales", { bultos: 1.5 }],
        ["cero kilos", { kilos: 0 }],
    ])("%s no es válido", (_, cambios) => {
        expect(modeloEsValido(metaNuevoEnvioAgencia)({ ...valido, ...cambios })).toBe(false);
    });
});

describe("infraestructura del envío por agencia", () => {
    test("envioAgenciaAApi pasa a snake_case y la fecha a ISO", () => {
        expect(envioAgenciaAApi({
            albaranId: "1",
            agenciaId: "CEX",
            servicio: "PAQ24",
            bultos: 2,
            kilos: 12.5,
            fechaRecogida: new Date(2026, 10, 12),
            observaciones: "",
        })).toEqual({
            albaran_id: "1",
            agencia_id: "CEX",
            servicio: "PAQ24",
            bultos: 2,
            kilos: 12.5,
            fecha_recogida: "2026-11-12",
            observaciones: null,
        });
    });

    test("ordenDesdeApi lee la agencia y el nº de envío de los albaranes", () => {
        const api = {
            id: "S00001", fecha: "2026-11-10", tipo: "SALIDA", almacen_id: "ALG", almacen: "General",
            abierta: false, estado: "TERMINADA", descripcion: "",
            ubicacion_origen_id: null, ubicacion_origen: null, caja_origen_id: null,
            ubicacion_destino_id: null, ubicacion_destino: null, caja_destino_id: null,
            pasos_pick: null, pasos_drop: null, lineas: [], lecturas_caja: [],
            albaranes: [
                { id: 1, codigo: "A1" },
                { id: 2, codigo: "A2", agencia_envio: "CEX", numero_tracking: "613000" },
            ],
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(ordenDesdeApi(api as any).albaranes).toEqual([
            { id: "1", codigo: "A1" },
            { id: "2", codigo: "A2", agenciaEnvio: "CEX", numeroTracking: "613000" },
        ]);
    });
});
