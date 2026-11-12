import { Cubo, FilaPivot, Medida, Miembro, PeticionPivot } from "./diseño.ts";
import {
  alternarAno,
  alternarMedida,
  alternarMes,
  alternarNodo,
  alternarTrimestre,
  apilar,
  arbolDesdePivot,
  asignarEje,
  cargaTerminadaDesdeEvento,
  cambiarFiltro,
  claveCodigo,
  claveRuta,
  columnasTabla,
  datosGrafico,
  ejerciciosDesdeTexto,
  etiquetarMeses,
  expandirNodo,
  filasTabla,
  historialNuevo,
  medidaDeColumna,
  moverHistorial,
  moverNivel,
  necesitaCargar,
  nombreExportacion,
  ordenTrasPulsar,
  miembroConocido,
  paginaDesdeLista,
  peticionNodo,
  resumenFiltro,
  rutasExpandidas,
} from "./dominio.ts";

const m = (codigo: Miembro["codigo"], etiqueta = String(codigo)): Miembro => ({ codigo, etiqueta });

const fila = (
  filas: (Miembro | null)[],
  columnas: (Miembro | null)[],
  importe: number | null
): FilaPivot => ({ filas, columnas, medidas: { importe } });

const importe: Medida = { id: "importe", descripcion: "Importe", agregacion: "suma", formato: "moneda" };
const cantidad: Medida = { id: "cantidad", descripcion: "Cantidad", agregacion: "suma", formato: "unidades" };

const peticion: PeticionPivot = {
  filas: ["articulo.familia", "articulo.articulo"],
  columnas: ["tiempo.ano"],
  medidas: ["importe"],
  filtros: { "cliente.cliente": ["C1"] },
  orden: null,
  top: null,
  excluirCeros: false,
};

const carga = [
  fila([null], [null], 100),
  fila([null], [m(2025)], 40),
  fila([null], [m(2026)], 60),
  fila([m("F2", "Bebidas")], [null], 70),
  fila([m("F1", "Comida")], [null], 30),
  fila([m("F2", "Bebidas")], [m(2026)], 50),
  fila([m("F2", "Bebidas")], [m(2025)], 20),
  fila([m("F1", "Comida")], [m(2025)], 20),
  fila([m("F1", "Comida")], [m(2026)], 10),
];

describe("peticionNodo", () => {
  test("sin ruta pide solo el primer nivel de filas", () => {
    expect(peticionNodo(peticion, [])).toEqual({ ...peticion, filas: ["articulo.familia"] });
  });

  test("al expandir pide el nivel siguiente filtrado por los ancestros", () => {
    expect(peticionNodo(peticion, [m("F1")])).toEqual({
      ...peticion,
      filas: ["articulo.familia", "articulo.articulo"],
      filtros: { "cliente.cliente": ["C1"], "articulo.familia": ["F1"] },
    });
  });

  test("el nodo sin valor se filtra con null", () => {
    expect(peticionNodo(peticion, [m(null, "(sin valor)")]).filtros["articulo.familia"]).toEqual([null]);
  });

  test("sin niveles en filas no cambia la petición", () => {
    const soloColumnas = { ...peticion, filas: [] };
    expect(peticionNodo(soloColumnas, [])).toEqual(soloColumnas);
  });
});

describe("arbolDesdePivot", () => {
  const arbol = arbolDesdePivot(carga);

  test("el total general sale de la fila sin miembros", () => {
    expect(arbol.total).toEqual({
      [claveRuta([])]: { importe: 100 },
      [claveRuta([m(2025)])]: { importe: 40 },
      [claveRuta([m(2026)])]: { importe: 60 },
    });
  });

  test("los nodos respetan el orden en que llegan, sin hijos cargados", () => {
    expect(arbol.nodos.map((n) => n.ruta)).toEqual([[m("F2", "Bebidas")], [m("F1", "Comida")]]);
    expect(arbol.nodos[0].hijos).toBeNull();
    expect(arbol.nodos[0].expandido).toBe(false);
    expect(arbol.nodos[0].valores[claveRuta([m(2025)])]).toEqual({ importe: 20 });
  });

  test("las columnas quedan ordenadas, con el total delante", () => {
    expect(arbol.columnas).toEqual([[], [m(2025)], [m(2026)]]);
  });
});

describe("expandirNodo", () => {
  const hijos = [
    fila([null, null], [null], 30),
    fila([m("F1", "Comida"), null], [null], 30),
    fila([m("F1", "Comida"), m("A2", "Pan")], [null], 25),
    fila([m("F1", "Comida"), m("A1", "Sal")], [null], 5),
    fila([m("F1", "Comida"), m("A2", "Pan")], [m(2025)], 15),
  ];
  const arbol = expandirNodo(arbolDesdePivot(carga), [m("F1", "Comida")], hijos);
  const comida = arbol.nodos[1];

  test("cuelga del nodo solo las filas del nivel siguiente", () => {
    expect(comida.expandido).toBe(true);
    expect(comida.hijos?.map((n) => n.ruta)).toEqual([
      [m("F1", "Comida"), m("A2", "Pan")],
      [m("F1", "Comida"), m("A1", "Sal")],
    ]);
    expect(comida.hijos?.[0].valores[claveRuta([m(2025)])]).toEqual({ importe: 15 });
  });

  test("no toca el resto de nodos", () => {
    expect(arbol.nodos[0].hijos).toBeNull();
  });

  test("con hijos cargados ya no necesita cargar y se puede contraer", () => {
    expect(necesitaCargar(arbol, [m("F1", "Comida")])).toBe(false);
    expect(necesitaCargar(arbol, [m("F2", "Bebidas")])).toBe(true);
    const contraido = alternarNodo(arbol, [m("F1", "Comida")]);
    expect(contraido.nodos[1].expandido).toBe(false);
    expect(contraido.nodos[1].hijos).toHaveLength(2);
  });
});

describe("columnasTabla", () => {
  const columnas = [[], [m(2025)], [m(2025), m("T1")], [m(2026)], [m(2026), m("T1")]];

  test("medidas en columnas: bajo cada miembro, con los subtotales a la izquierda", () => {
    const resultado = columnasTabla(columnas, [importe, cantidad], 2, true);
    expect(resultado.map((c) => [c.grupo, c.cabecera])).toEqual([
      [["Total"], "Importe"],
      [["Total"], "Cantidad"],
      [["2025", "Total"], "Importe"],
      [["2025", "Total"], "Cantidad"],
      [["2025", "T1"], "Importe"],
      [["2025", "T1"], "Cantidad"],
      [["2026", "Total"], "Importe"],
      [["2026", "Total"], "Cantidad"],
      [["2026", "T1"], "Importe"],
      [["2026", "T1"], "Cantidad"],
    ]);
    expect(resultado[0]).toMatchObject({ id: `${claveRuta([])}|importe`, tipo: "moneda" });
    expect(resultado[1]).toMatchObject({ tipo: "numero", decimales: 0 });
  });

  test("con una sola medida en columnas no se repite su nombre: cabecera por miembro", () => {
    const resultado = columnasTabla(columnas, [importe], 2, true);
    expect(resultado.map((c) => [c.grupo, c.cabecera])).toEqual([
      [[], "Total"],
      [["2025"], "Total"],
      [["2025"], "T1"],
      [["2026"], "Total"],
      [["2026"], "T1"],
    ]);
    expect(resultado[2]).toMatchObject({ id: `${claveRuta([m(2025), m("T1")])}|importe`, tipo: "moneda" });
  });

  test("medidas en filas: una columna por miembro", () => {
    expect(columnasTabla(columnas, [importe], 2, false).map((c) => [c.grupo, c.cabecera])).toEqual([
      [[], "Total"],
      [["2025"], "Total"],
      [["2025"], "T1"],
      [["2026"], "Total"],
      [["2026"], "T1"],
    ]);
  });

  test("sin niveles en columnas, solo las medidas", () => {
    expect(columnasTabla([[]], [importe], 0, true).map((c) => [c.grupo, c.cabecera])).toEqual([[[], "Importe"]]);
  });
});

describe("filasTabla", () => {
  const arbol = expandirNodo(arbolDesdePivot(carga), [m("F2", "Bebidas")], [
    fila([m("F2", "Bebidas"), m("A9", "Agua")], [null], 70),
  ]);

  test("medidas en columnas: nodos en preorden y el total al final", () => {
    const filas = filasTabla(arbol, [importe], 2, true);
    expect(filas.map((f) => [f.etiqueta, f.nivel, f.expandible, f.expandida, f.destacada])).toEqual([
      ["Bebidas", 0, true, true, true],
      ["Agua", 1, false, false, false],
      ["Comida", 0, true, false, false],
      ["Total", 0, false, false, true],
    ]);
    expect(filas[0].valores[`${claveRuta([m(2026)])}|importe`]).toBe(50);
  });

  test("medidas en filas: una fila por medida bajo cada miembro", () => {
    const filas = filasTabla(arbolDesdePivot(carga), [importe], 1, false);
    expect(filas.map((f) => [f.etiqueta, f.nivel])).toEqual([
      ["Bebidas", 0],
      ["Importe", 1],
      ["Comida", 0],
      ["Importe", 1],
      ["Total", 0],
      ["Importe", 1],
    ]);
    expect(filas[1].valores[claveRuta([])]).toBe(70);
  });
});

describe("ordenTrasPulsar", () => {
  test("una medida nueva ordena descendente y repetirla invierte", () => {
    expect(ordenTrasPulsar(null, "importe")).toEqual({ por: "importe", sentido: "desc" });
    expect(ordenTrasPulsar({ por: "importe", sentido: "desc" }, "importe")).toEqual({ por: "importe", sentido: "asc" });
    expect(ordenTrasPulsar({ por: "importe", sentido: "asc" }, "cantidad")).toEqual({ por: "cantidad", sentido: "desc" });
  });
});

describe("moverNivel", () => {
  test("de filas a columnas, al final", () => {
    expect(moverNivel(peticion, "articulo.familia", "columnas")).toMatchObject({
      filas: ["articulo.articulo"],
      columnas: ["tiempo.ano", "articulo.familia"],
    });
  });

  test("delante de otro nivel del mismo eje", () => {
    expect(moverNivel(peticion, "articulo.articulo", "filas", "articulo.familia").filas).toEqual([
      "articulo.articulo",
      "articulo.familia",
    ]);
  });

  test("sin destino lo quita de los ejes", () => {
    expect(moverNivel(peticion, "tiempo.ano", null).columnas).toEqual([]);
  });
});

describe("alternarMedida", () => {
  test("añade en el orden del cubo y no deja quitar la última", () => {
    const conAmbas = alternarMedida({ ...peticion, medidas: ["cantidad"] }, "importe", [importe, cantidad]);
    expect(conAmbas.medidas).toEqual(["importe", "cantidad"]);
    expect(alternarMedida(peticion, "importe", [importe, cantidad]).medidas).toEqual(["importe"]);
  });

  test("quitar la medida del orden quita el orden", () => {
    const ordenada = { ...peticion, medidas: ["importe", "cantidad"], orden: { por: "cantidad", sentido: "desc" as const } };
    expect(alternarMedida(ordenada, "cantidad", [importe, cantidad]).orden).toBeNull();
  });
});

describe("cambiarFiltro", () => {
  test("sin códigos quita el filtro", () => {
    expect(cambiarFiltro(peticion, "cliente.cliente", []).filtros).toEqual({});
    expect(cambiarFiltro(peticion, "tiempo.ano", [2025, null]).filtros).toEqual({
      "cliente.cliente": ["C1"],
      "tiempo.ano": [2025, null],
    });
  });
});

describe("medidaDeColumna", () => {
  test("saca la medida del id de columna", () => {
    expect(medidaDeColumna(`${claveRuta([])}|importe`)).toBe("importe");
    expect(medidaDeColumna(claveRuta([]))).toBeNull();
  });
});

describe("nombreExportacion", () => {
  test("cubo y fecha local en AAAAMMDD", () => {
    expect(nombreExportacion("ventas", new Date(2026, 0, 5))).toBe("ventas-20260105.xlsx");
  });
});

describe("etiquetarMeses", () => {
  const cubo: Cubo = {
    id: "ventas",
    descripcion: "Ventas",
    dimensiones: [
      {
        id: "tiempo",
        descripcion: "Tiempo",
        niveles: [
          { ref: "tiempo.ano", id: "ano", descripcion: "Año", tipo: "ano" },
          { ref: "tiempo.mes", id: "mes", descripcion: "Mes", tipo: "mes" },
        ],
        jerarquias: [],
      },
      {
        id: "articulo",
        descripcion: "Artículo",
        niveles: [{ ref: "articulo.familia", id: "familia", descripcion: "Familia", tipo: null }],
        jerarquias: [],
      },
    ],
    medidas: [importe],
    ultimaCarga: null,
    estadoCarga: null,
  };
  const base = { ...peticion, filas: ["articulo.familia"], columnas: ["tiempo.mes"] };

  test("el mes sin año por encima en su eje lleva el año", () => {
    const [resultado] = etiquetarMeses(cubo, base, [fila([m("F1")], [m("202601", "Enero")], 1)]);
    expect(resultado.columnas).toEqual([m("202601", "Enero 2026")]);
    expect(resultado.filas).toEqual([m("F1")]);
  });

  test("con el año delante en el mismo eje se deja como está", () => {
    const conAno = { ...base, columnas: ["tiempo.ano", "tiempo.mes"] };
    const [resultado] = etiquetarMeses(cubo, conAno, [fila([m("F1")], [m(2026), m("202601", "Enero")], 1)]);
    expect(resultado.columnas[1]).toEqual(m("202601", "Enero"));
  });

  test("subtotales y sin valor no se tocan", () => {
    const [subtotal, sinValor] = etiquetarMeses(cubo, base, [
      fila([m("F1")], [null], 1),
      fila([m("F1")], [m(null, "(sin valor)")], 1),
    ]);
    expect(subtotal.columnas).toEqual([null]);
    expect(sinValor.columnas).toEqual([m(null, "(sin valor)")]);
  });
});

describe("historial", () => {
  const p = (top: number) => ({ ...peticion, top });

  test("apilar descarta lo que había hacia delante y guarda como mucho 10", () => {
    const atras = moverHistorial(apilar(apilar(historialNuevo(p(1)), p(2)), p(3)), -1);
    expect(atras.posicion).toBe(1);
    const nuevo = apilar(atras, p(4));
    expect(nuevo.peticiones.map((x) => x.top)).toEqual([1, 2, 4]);

    const lleno = Array.from({ length: 12 }, (_, i) => p(i)).reduce(apilar, historialNuevo(p(-1)));
    expect(lleno.peticiones).toHaveLength(10);
    expect(lleno.posicion).toBe(9);
  });

  test("no se mueve fuera de los extremos", () => {
    const h = historialNuevo(p(1));
    expect(moverHistorial(h, -1)).toBe(h);
    expect(moverHistorial(h, 1)).toBe(h);
  });
});

describe("botoneras de tiempo", () => {
  const cubo: Cubo = {
    id: "ventas",
    descripcion: "Ventas",
    dimensiones: [{
      id: "tiempo",
      descripcion: "Tiempo",
      niveles: [
        { ref: "tiempo.ano", id: "ano", descripcion: "Año", tipo: "ano" },
        { ref: "tiempo.trimestre", id: "trimestre", descripcion: "Trimestre", tipo: "trimestre" },
        { ref: "tiempo.mes", id: "mes", descripcion: "Mes", tipo: "mes" },
      ],
      jerarquias: [],
    }],
    medidas: [importe],
    ultimaCarga: null,
    estadoCarga: null,
  };
  const vacia = { ...peticion, filtros: {} };

  test("un mes sin años elegidos se aplica a los años de la botonera", () => {
    expect(alternarMes(vacia, cubo, 1, [2025, 2026]).filtros).toEqual({ "tiempo.mes": ["202501", "202601"] });
  });

  test("elegir año rehace los meses solo para ese año", () => {
    const conEnero = alternarMes(vacia, cubo, 1, [2025, 2026]);
    expect(alternarAno(conEnero, cubo, 2026, [2025, 2026]).filtros).toEqual({
      "tiempo.ano": [2026],
      "tiempo.mes": ["202601"],
    });
  });

  test("volver a pulsar quita el filtro", () => {
    const conEnero = alternarMes(vacia, cubo, 1, [2025]);
    expect(alternarMes(conEnero, cubo, 1, [2025]).filtros).toEqual({});
    const conT1 = alternarTrimestre(vacia, cubo, "T1");
    expect(conT1.filtros).toEqual({ "tiempo.trimestre": ["T1"] });
    expect(alternarTrimestre(conT1, cubo, "T1").filtros).toEqual({});
  });
});

describe("datosGrafico", () => {
  test("una serie por miembro de columna y un punto por nodo", () => {
    const datos = datosGrafico(arbolDesdePivot(carga), importe, 1);
    expect(datos.series).toEqual([
      { clave: claveRuta([m(2025)]), nombre: "2025" },
      { clave: claveRuta([m(2026)]), nombre: "2026" },
    ]);
    expect(datos.puntos[0]).toEqual({ etiqueta: "Bebidas", [claveRuta([m(2025)])]: 20, [claveRuta([m(2026)])]: 50 });
  });

  test("sin columnas, una sola serie con el total", () => {
    const datos = datosGrafico(arbolDesdePivot(carga), importe, 0);
    expect(datos.series).toEqual([{ clave: claveRuta([]), nombre: "Importe" }]);
    expect(datos.puntos[1]).toEqual({ etiqueta: "Comida", [claveRuta([])]: 30 });
  });
});

describe("ejerciciosDesdeTexto", () => {
  test("separa por comas o espacios, sin vacíos ni repetidos", () => {
    expect(ejerciciosDesdeTexto(" 2025, 2026 ;2026  ")).toEqual(["2025", "2026"]);
    expect(ejerciciosDesdeTexto("  ")).toEqual([]);
  });
});

describe("cargaTerminadaDesdeEvento", () => {
  test("lee el JSON del evento", () => {
    expect(
      cargaTerminadaDesdeEvento('{"carga_id": 12, "cubo_id": "ventas", "estado": "ok", "filas": 345, "mensaje": null}')
    ).toEqual({ cargaId: 12, cuboId: "ventas", estado: "ok", filas: 345, mensaje: null });
    expect(cargaTerminadaDesdeEvento({ cubo_id: "ventas", estado: "error", mensaje: "Sin datos" })).toEqual({
      cargaId: null,
      cuboId: "ventas",
      estado: "error",
      filas: null,
      mensaje: "Sin datos",
    });
  });

  test("un estado desconocido se ignora", () => {
    expect(cargaTerminadaDesdeEvento({ cubo_id: "ventas", estado: "en_curso" })).toBeNull();
  });

  test("datos no válidos se ignoran", () => {
    expect(cargaTerminadaDesdeEvento("no es json")).toBeNull();
    expect(cargaTerminadaDesdeEvento(null)).toBeNull();
    expect(cargaTerminadaDesdeEvento({ estado: "ok" })).toBeNull();
  });
});

describe("rutasExpandidas", () => {
  test("los nodos expandidos con hijos, padres antes que hijos", () => {
    const arbol = expandirNodo(arbolDesdePivot(carga), [m("F2", "Bebidas")], [
      fila([m("F2", "Bebidas"), m("A9", "Agua")], [null], 70),
    ]);
    expect(rutasExpandidas(arbol)).toEqual([[m("F2", "Bebidas")]]);
    expect(rutasExpandidas(alternarNodo(arbol, [m("F2", "Bebidas")]))).toEqual([]);
  });
});

describe("resumenFiltro", () => {
  const etiquetas = { [claveCodigo("C1")]: "Acme", [claveCodigo(2025)]: "2025", [claveCodigo(null)]: "(sin valor)" };

  test("hasta tres valores, todos; con más, los dos primeros y cuántos faltan", () => {
    expect(resumenFiltro(["C1", 2025, null], etiquetas)).toBe("Acme, 2025, (sin valor)");
    expect(resumenFiltro(["C1", "C2", "C3", "C4"], etiquetas)).toBe("Acme, C2 y 2 más");
  });

  test("el código vale como etiqueta si no se conoce; el año en número o en texto es el mismo", () => {
    expect(resumenFiltro(["2025", null], {})).toBe("2025, (sin valor)");
    expect(claveCodigo(2025)).toBe(claveCodigo("2025"));
  });
});

describe("asignarEje", () => {
  test("pone los niveles en el orden dado y los quita del otro eje", () => {
    expect(asignarEje(peticion, "columnas", ["articulo.familia", "tiempo.ano"])).toMatchObject({
      filas: ["articulo.articulo"],
      columnas: ["articulo.familia", "tiempo.ano"],
    });
    expect(asignarEje(peticion, "filas", [])).toMatchObject({ filas: [], columnas: ["tiempo.ano"] });
  });
});

describe("paginaDesdeLista", () => {
  const lista = ["A", "B", "C", "D", "E"].map((c) => m(c, `Etiqueta ${c}`));
  const consulta = { filtros: {}, buscar: "", todos: false, limite: 2, desplazamiento: 0, seleccionados: ["B", "Z"] };

  test("la primera página no repite los elegidos y trae las etiquetas de los que encuentra", () => {
    expect(paginaDesdeLista(lista, false, consulta)).toEqual({
      miembros: [m("A", "Etiqueta A"), m("C", "Etiqueta C")],
      hayMas: true,
      seleccionados: [m("B", "Etiqueta B")],
    });
  });

  test("las siguientes páginas siguen donde se quedó y no traen elegidos", () => {
    expect(paginaDesdeLista(lista, false, { ...consulta, desplazamiento: 2 })).toEqual({
      miembros: [m("D", "Etiqueta D"), m("E", "Etiqueta E")],
      hayMas: false,
      seleccionados: [],
    });
    expect(paginaDesdeLista(lista, true, { ...consulta, desplazamiento: 2 }).hayMas).toBe(true);
  });
});

describe("miembroConocido", () => {
  test("usa la etiqueta conocida o, si no, el código", () => {
    expect(miembroConocido(2025, [m("2025", "Año 2025")])).toEqual(m("2025", "Año 2025"));
    expect(miembroConocido("Z", [])).toEqual(m("Z", "Z"));
    expect(miembroConocido(null, [])).toEqual(m(null, "(sin valor)"));
  });
});
