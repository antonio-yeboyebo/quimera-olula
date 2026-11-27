import { ColumnaCatalogo } from "./diseño.ts";
import {
  aplicarColumnas,
  aplicarTarjeta,
  botonesQueCaben,
  desbordarAcciones,
  configTablaDesdeVisibles,
  desplazarColumna,
  mismoOrden,
  modoDeVista,
  moverColumna,
  ocultarColumna,
  repartirAcciones,
  ordenPorDefecto,
  idDeVista,
  sinGrupoAcciones,
  sinListado,
} from "./dominio.ts";

const catalogo: ColumnaCatalogo[] = [
  { id: "codigo" },
  { id: "fecha" },
  { id: "cliente" },
  { id: "total" },
  { id: "observaciones", oculta: true },
];

const ids = (columnas: { id: string }[]) => columnas.map((c) => c.id);

describe("aplicarColumnas", () => {
  test("sin configuración, las del catálogo que no son ocultas", () => {
    expect(ids(aplicarColumnas(catalogo))).toEqual(["codigo", "fecha", "cliente", "total"]);
  });

  test("respeta el orden y las ocultas del usuario", () => {
    const config = {
      columnas: ["total", "codigo"],
      ocultas: ["fecha", "cliente", "observaciones"],
    };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["total", "codigo"]);
  });

  test("una columna oculta por defecto se ve si el usuario la eligió", () => {
    const config = { columnas: ["observaciones", "codigo"], ocultas: [] };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual([
      "observaciones",
      "codigo",
      "fecha",
      "cliente",
      "total",
    ]);
  });

  test("ignora ids que ya no están en el catálogo", () => {
    const config = {
      columnas: ["codigo", "borrada", "total"],
      ocultas: ["fecha", "cliente", "observaciones"],
    };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["codigo", "total"]);
  });

  test("una columna nueva visible sale detrás de la que le precede en el catálogo", () => {
    // `cliente` no estaba cuando el usuario guardó.
    const config = { columnas: ["fecha", "codigo", "total"], ocultas: ["observaciones"] };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual([
      "fecha",
      "cliente",
      "codigo",
      "total",
    ]);
  });

  test("una columna nueva sin predecesora colocada va al principio", () => {
    const config = { columnas: ["total"], ocultas: ["fecha", "cliente", "observaciones"] };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["codigo", "total"]);
  });

  test("una columna nueva oculta por defecto no aparece", () => {
    const config = { columnas: ["codigo"], ocultas: ["fecha", "cliente", "total"] };
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["codigo"]);
  });

  test("conserva el resto de propiedades de la columna", () => {
    const conCabecera = [{ id: "codigo", cabecera: "Código" }];
    expect(aplicarColumnas(conCabecera, { columnas: ["codigo"] })).toEqual(conCabecera);
  });
});

describe("configTablaDesdeVisibles", () => {
  test("lo no elegido pasa a ocultas y se conserva el orden guardado", () => {
    expect(
      configTablaDesdeVisibles(catalogo, ["total", "codigo", "borrada"], {
        columnas: [],
        orden: ["fecha", "DESC"],
      })
    ).toEqual({
      columnas: ["total", "codigo"],
      ocultas: ["fecha", "cliente", "observaciones"],
      orden: ["fecha", "DESC"],
    });
  });

  test("ida y vuelta con aplicarColumnas", () => {
    const config = configTablaDesdeVisibles(catalogo, ["cliente", "fecha"]);
    expect(ids(aplicarColumnas(catalogo, config))).toEqual(["cliente", "fecha"]);
  });
});

describe("repartir acciones", () => {
  const acciones = [
    { id: "albaranar", texto: "Albarán parcial" },
    { id: "imprimir", texto: "Imprimir" },
    { texto: "Sin id" },
    { id: "borrar", texto: "Borrar" },
  ];
  const textos = (lista: { texto: string }[]) => lista.map((a) => a.texto);
  const primera = <A,>(lista: A[]) => lista[0];

  test("sin configuración, la principal que da el código", () => {
    const reparto = repartirAcciones(acciones, undefined, (lista) => lista[1]);
    expect(textos(reparto.botones)).toEqual(["Imprimir"]);
    expect(textos(reparto.menu)).toEqual(["Albarán parcial", "Sin id", "Borrar"]);
  });

  test("con destacadas, esas en su orden y el resto en el del código", () => {
    const reparto = repartirAcciones(acciones, ["borrar", "vieja", "albaranar"], primera);
    expect(textos(reparto.botones)).toEqual(["Borrar", "Albarán parcial"]);
    expect(textos(reparto.menu)).toEqual(["Imprimir", "Sin id"]);
  });

  test("con la lista vacía, todo al desplegable", () => {
    const reparto = repartirAcciones(acciones, [], primera);
    expect(reparto.botones).toEqual([]);
    expect(reparto.menu).toHaveLength(4);
  });

  test("lo que no cabe pasa al principio del desplegable", () => {
    const reparto = desbordarAcciones({ botones: ["a", "b", "c"], menu: ["d"] }, 1);
    expect(reparto).toEqual({ botones: ["a"], menu: ["b", "c", "d"] });
    expect(desbordarAcciones({ botones: ["a"], menu: [] }, 5)).toEqual({ botones: ["a"], menu: [] });
  });

  test("botones que caben", () => {
    // 3 botones de 100 con hueco 10 = 320; desplegable de 40.
    expect(botonesQueCaben([100, 100, 100], 320, 10, 40, false)).toBe(3);
    // Si queda menú hay que reservar su botón.
    expect(botonesQueCaben([100, 100, 100], 320, 10, 40, true)).toBe(2);
    // Al no caber todos aparece el desplegable y se reserva su sitio.
    expect(botonesQueCaben([100, 100, 100], 300, 10, 40, false)).toBe(2);
    expect(botonesQueCaben([100, 100, 100], 120, 10, 40, false)).toBe(0);
    expect(botonesQueCaben([], 500, 10, 40, true)).toBe(0);
  });
});

describe("aplicarTarjeta", () => {
  test("quita los huecos con ids que ya no existen", () => {
    expect(
      aplicarTarjeta(catalogo, {
        titulo: "cliente",
        subtitulo: "borrada",
        etiqueta: "fecha",
        campos: ["total", "borrada"],
      })
    ).toEqual({ titulo: "cliente", subtitulo: undefined, etiqueta: "fecha", campos: ["total"] });
  });

  test("sin configuración, undefined", () => {
    expect(aplicarTarjeta(catalogo)).toBeUndefined();
  });

  test("si no queda ningún hueco válido, undefined (manda la tarjeta del código)", () => {
    expect(aplicarTarjeta(catalogo, { titulo: "borrada", campos: ["otra"] })).toBeUndefined();
  });

  test("como mucho tres campos", () => {
    expect(
      aplicarTarjeta(catalogo, { campos: ["codigo", "fecha", "cliente", "total"] })?.campos
    ).toEqual(["codigo", "fecha", "cliente"]);
  });
});

describe("orden y modo", () => {
  test("la ordenación guardada manda sobre la del código", () => {
    expect(ordenPorDefecto({ tabla: { columnas: [], orden: ["total", "ASC"] } }, ["fecha", "DESC"]))
      .toEqual(["total", "ASC"]);
    expect(ordenPorDefecto(undefined, ["fecha", "DESC"])).toEqual(["fecha", "DESC"]);
  });

  test("el modo guardado solo si la pantalla lo admite", () => {
    expect(modoDeVista({ modo: "tarjetas" }, ["tabla", "tarjetas"], "tabla")).toBe("tarjetas");
    expect(modoDeVista({ modo: "kanban" }, ["tabla", "tarjetas"], "tabla")).toBe("tabla");
    expect(modoDeVista(undefined, ["tabla"])).toBeUndefined();
  });
});

describe("mover y ocultar columnas", () => {
  const visibles = ["codigo", "fecha", "cliente", "total"];

  test("mover a la posición de otra, hacia delante y hacia atrás", () => {
    expect(moverColumna(visibles, "total", "fecha")).toEqual(["codigo", "total", "fecha", "cliente"]);
    expect(moverColumna(visibles, "codigo", "cliente")).toEqual(["fecha", "cliente", "codigo", "total"]);
  });

  test("mover sobre sí misma o con ids desconocidos no cambia nada", () => {
    expect(moverColumna(visibles, "fecha", "fecha")).toBe(visibles);
    expect(moverColumna(visibles, "otra", "fecha")).toBe(visibles);
  });

  test("desplazar una posición, sin salirse de los extremos", () => {
    expect(desplazarColumna(visibles, "fecha", -1)).toEqual(["fecha", "codigo", "cliente", "total"]);
    expect(desplazarColumna(visibles, "fecha", 1)).toEqual(["codigo", "cliente", "fecha", "total"]);
    expect(desplazarColumna(visibles, "codigo", -1)).toBe(visibles);
    expect(desplazarColumna(visibles, "total", 1)).toBe(visibles);
  });

  test("ocultar, salvo la última visible", () => {
    expect(ocultarColumna(visibles, "fecha")).toEqual(["codigo", "cliente", "total"]);
    expect(ocultarColumna(["codigo"], "codigo")).toEqual(["codigo"]);
  });

  test("mismo orden", () => {
    expect(mismoOrden(["fecha", "DESC"], ["fecha", "DESC"])).toBe(true);
    expect(mismoOrden(["fecha"], ["fecha", "ASC"])).toBe(true);
    expect(mismoOrden(["fecha", "ASC"], ["fecha", "DESC"])).toBe(false);
    expect(mismoOrden(undefined, ["fecha", "DESC"])).toBe(false);
  });
});

describe("restaurar una parte de la configuración", () => {
  const config = {
    modo: "tarjetas" as const,
    tabla: { columnas: ["codigo"] },
    acciones: { detalle: ["imprimir"], lineas: ["borrar"] },
  };

  test("sin listado quedan los botones", () => {
    expect(sinListado(config)).toEqual({ acciones: config.acciones });
  });

  test("sin un grupo quedan el resto de grupos y el listado", () => {
    expect(sinGrupoAcciones(config, "detalle")).toEqual({
      modo: "tarjetas",
      tabla: { columnas: ["codigo"] },
      acciones: { lineas: ["borrar"] },
    });
  });

  test("si no queda nada, undefined (se borra la fila)", () => {
    expect(sinListado({ tabla: { columnas: ["codigo"] } })).toBeUndefined();
    expect(sinGrupoAcciones({ acciones: { detalle: ["imprimir"] } }, "detalle")).toBeUndefined();
    expect(sinListado({ acciones: {} })).toBeUndefined();
  });
});

describe("idDeVista", () => {
  test("del nombre visible a un id que admite el servidor", () => {
    expect(idDeVista("Mis pendientes de envío", [])).toBe("mis_pendientes_de_envio");
    expect(idDeVista("  ¡Año 2026!  ", [])).toBe("ano_2026");
    expect(idDeVista("???", [])).toBe("vista");
  });

  test("sin repetir uno existente", () => {
    expect(idDeVista("Urgentes", ["urgentes", "urgentes_2"])).toBe("urgentes_3");
  });
});
