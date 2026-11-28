import { MetaModelo } from "@olula/lib/dominio.ts";
import { Banco, CambiosSucursal, DatosSucursal, NuevaSucursal, NuevoBanco, Sucursal } from "./diseño.ts";
import { tTesoreria } from "../i18n/index.ts";

export const REGLA_BANCO = "comun.banco";

/** `bancos.mtd` / `sucursales.mtd`: entidad y oficina son 4 dígitos. */
export const PATRON_CUATRO_DIGITOS = /^[0-9]{4}$/;

export const bancoVacio = (): Banco => ({
    id: "",
    nombre: "",
    proveedorId: "",
    nombreProveedor: "",
    bicDefecto: "",
    sucursales: [],
});

export const nuevoBancoVacio = (): NuevoBanco => ({
    id: "",
    nombre: "",
    proveedorId: "",
    bicDefecto: "",
});

export const datosSucursalVacios = (): DatosSucursal => ({
    agencia: "",
    nombre: "",
    direccion: "",
    codigoPostal: "",
    apartado: "",
    poblacion: "",
    provincia: "",
    paisId: "",
    telefono: "",
    fax: "",
    contacto: "",
    observaciones: "",
});

export const nuevaSucursalVacia = (): NuevaSucursal => datosSucursalVacios();

export const etiquetaBanco = (b: Banco): string => (b.nombre ? `${b.id} — ${b.nombre}` : b.id);

export const etiquetaSucursal = (s: Sucursal): string =>
    s.nombre ? `${s.agencia} — ${s.nombre}` : s.agencia;

const camposBanco = {
    nombre: { requerido: true, maximo: 100 },
    proveedorId: { requerido: false, tipo: "autocompletar" as const },
    bicDefecto: { requerido: false, maximo: 11 },
};

export const metaBanco: MetaModelo<Banco> = { campos: camposBanco };

export const metaNuevoBanco: MetaModelo<NuevoBanco> = {
    campos: {
        id: {
            requerido: true,
            maximo: 4,
            validacion: (b: NuevoBanco) =>
                PATRON_CUATRO_DIGITOS.test(b.id) || tTesoreria("banco.elNDeEntidadDebeTener"),
        },
        ...camposBanco,
    },
};

export const metaSucursal: MetaModelo<NuevaSucursal> = {
    campos: {
        agencia: {
            requerido: true,
            maximo: 4,
            validacion: (s: NuevaSucursal) =>
                PATRON_CUATRO_DIGITOS.test(s.agencia) || tTesoreria("banco.elNDeOficinaDebeTener"),
        },
        nombre: { requerido: false, maximo: 100 },
        direccion: { requerido: false, maximo: 100 },
        codigoPostal: { requerido: false, maximo: 10 },
        apartado: { requerido: false, maximo: 10 },
        poblacion: { requerido: false, maximo: 100 },
        provincia: { requerido: false, maximo: 100 },
        paisId: { requerido: false, tipo: "autocompletar" },
        telefono: { requerido: false, maximo: 50 },
        fax: { requerido: false, maximo: 50 },
        contacto: { requerido: false, maximo: 100 },
        observaciones: { requerido: false },
    },
};

export const cambiosSucursal = (previa: Sucursal, actual: NuevaSucursal): CambiosSucursal => {
    const cambios: CambiosSucursal = {};
    for (const campo of Object.keys(datosSucursalVacios()) as (keyof DatosSucursal)[]) {
        if (actual[campo] !== previa[campo]) cambios[campo] = actual[campo];
    }
    return cambios;
};
