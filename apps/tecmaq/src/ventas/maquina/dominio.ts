import { ComponenteMaquina, FaseMaquina, Maquina } from "./diseño.ts";

export const maquinaVacia = (): Maquina => ({
    id: "",
    referencia: "",
    descripcion: "",
    cliente: "",
    codigoPedido: "",
    fecha: "",
    componentes: [],
});

export const esHoja = (c: ComponenteMaquina): boolean =>
    c.componentes.length === 0;

// Helpers internos
const fase = (id: string, codigo: string, observaciones: string, proveedor: string, estado: FaseMaquina["estado"], numDoc?: string): FaseMaquina => ({
    id, codigo, observaciones, proveedor, estado, ...(numDoc !== undefined ? { numDoc } : {}),
});

const hoja = (
    id: string,
    orden: number,
    cantidad: number,
    referencia: string,
    descripcion: string,
    estado: ComponenteMaquina["estado"],
    ruta: ComponenteMaquina["ruta"],
    fases: FaseMaquina[],
): ComponenteMaquina => ({
    id, orden, cantidad, referencia, descripcion, estado, ruta,
    componentes: [],
    fases,
});

const rama = (
    id: string,
    orden: number,
    cantidad: number,
    referencia: string,
    descripcion: string,
    estado: ComponenteMaquina["estado"],
    ruta: ComponenteMaquina["ruta"],
    componentes: ComponenteMaquina[],
): ComponenteMaquina => ({
    id, orden, cantidad, referencia, descripcion, estado, ruta,
    componentes,
    fases: [],
});

export const MAQUINAS_MOCK: Maquina[] = [
    {
        id: "1",
        referencia: "ALIMAT-160/2",
        descripcion: "Conjunt bancada amb elevador i pales",
        cliente: "ALIMAT",
        codigoPedido: "ALIMAT-160/2",
        fecha: "16-04-24",
        componentes: [
            hoja("c1", 1, 1, "542.001-1", "PIEZA BANCADA", "Listo", "Defecto", [
                fase("f1", "Laser", "Corte laser inox", "LaserTech SL", "Recibido", "20260A000001"),
                fase("f2", "Mecan.", "Mecanitzat CNC", "Taller Gomez", "Recibido", "20260A000002"),
            ]),
            rama("c2", 2, 1, "542.002-1", "TOLVA BANCADA", "En Curso", "Defecto", [
                hoja("c21", 1, 1, "542.002-01", "APOYO DELANTERO", "Listo", "Defecto", [
                    fase("f21", "Laser", "Corte inox", "LaserTech SL", "Recibido", "20260A000003"),
                ]),
                hoja("c22", 2, 1, "542.002-02", "APOYO TRASERO", "Listo", "Defecto", [
                    fase("f22", "Laser", "Corte inox", "LaserTech SL", "Recibido", "20260A000004"),
                ]),
                rama("c23", 3, 1, "542.002-03", "APOYO TENSOR", "En Curso", "Defecto", [
                    hoja("c231", 1, 1, "542.002-031", "BASE", "Listo", "Defecto", [
                        fase("f231", "Laser", "Laser AISI-304", "LaserTech SL", "Recibido", "20260A000005"),
                    ]),
                    hoja("c232", 2, 1, "542.002-032", "VARILLA ROSCADA", "Pendiente", "Proveedor", [
                        fase("f232", "Comercial", "Rosca M24", "Ferros SA", "Pedido", "20260A000006"),
                    ]),
                    hoja("c233", 3, 1, "YPAFC04010", "PASAMANO 40x10x85", "Pendiente", "Defecto", [
                        fase("f233", "Laser", "40x10x85 F-111", "LaserTech SL", "Pendiente"),
                    ]),
                ]),
                rama("c24", 4, 1, "542.002-07-1", "TREMUJA AMB PALES", "En Curso", "Defecto", [
                    hoja("c241", 1, 1, "542.002-071", "PLANXA CENTRAL", "Listo", "Defecto", [
                        fase("f241", "Laser", "AISI-304 planxa central", "LaserTech SL", "Recibido", "20260A000007"),
                    ]),
                    hoja("c242", 2, 1, "542.002-072", "PLANXA TRASERA", "En Curso", "Proveedor", [
                        fase("f242a", "Laser", "AISI-304 planxa trasera", "MetalCut SL", "Recibido", "20260A000008"),
                        fase("f242b", "Pulit", "Acabat superficial", "Pulits SA", "Pedido", "20260A000009"),
                    ]),
                ]),
            ]),
            hoja("c3", 3, 1, "542.003", "TAPA POSTERIOR", "Pendiente", "Defecto", [
                fase("f3a", "Laser", "AISI-304 640x940", "LaserTech SL", "Pendiente"),
                fase("f3b", "Dobla", "Doblat", "Taller Gomez", "Pendiente"),
            ]),
            hoja("c4", 4, 1, "542.004", "TAPA LAT. IZQ.", "Listo", "Defecto", [
                fase("f4", "Laser", "AISI-304 550x550", "LaserTech SL", "Recibido", "20260A000010"),
            ]),
            hoja("c5", 5, 1, "542.005", "TAPA LAT. DER.", "Listo", "Defecto", [
                fase("f5", "Laser", "AISI-304 680x500", "LaserTech SL", "Recibido", "20260A000011"),
            ]),
        ],
    },
    {
        id: "2",
        referencia: "TECMAQ-200/1",
        descripcion: "Estructura modular transport",
        cliente: "MECANIZADOS SL",
        codigoPedido: "MC-2024-089",
        fecha: "10-03-24",
        componentes: [
            rama("tm1", 1, 1, "TM-201", "BASTIDOR PRINCIPAL", "En Curso", "Defecto", [
                hoja("tm1a", 1, 1, "TM-201-01", "PERFIL UPN-120", "Listo", "Defecto", [
                    fase("ftm1a", "Laser", "UPN-120x2000", "MetalCut SL", "Recibido", "20260A000012"),
                ]),
                hoja("tm1b", 2, 1, "TM-201-02", "PLACA BASE", "En Curso", "Defecto", [
                    fase("ftm1b", "Laser", "15mm S275", "MetalCut SL", "Pedido", "20260A000013"),
                ]),
            ]),
            hoja("tm2", 2, 1, "TM-202", "PANEL LATERAL", "Pendiente", "Defecto", [
                fase("ftm2", "Laser", "Inox 2mm", "LaserTech SL", "Pendiente"),
            ]),
        ],
    },
    {
        id: "3",
        referencia: "TECMAQ-110/3",
        descripcion: "Bancada simple elevador",
        cliente: "ALIMAT",
        codigoPedido: "AL-2024-012",
        fecha: "02-02-24",
        componentes: [
            hoja("bc1", 1, 1, "BC-101", "PLANXA BANCADA", "Listo", "Defecto", [
                fase("fbc1", "Laser", "AISI-304 10mm", "LaserTech SL", "Recibido", "20260A000014"),
            ]),
            hoja("bc2", 2, 1, "BC-102", "PERFIL GUIA", "Listo", "Defecto", [
                fase("fbc2", "Mecan.", "Guia linear", "Taller Gomez", "Recibido", "20260A000015"),
            ]),
        ],
    },
];
