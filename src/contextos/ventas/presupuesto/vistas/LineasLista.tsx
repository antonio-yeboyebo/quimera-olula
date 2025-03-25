import { InputNumerico } from "../../../../componentes/detalle/FormularioGenerico.tsx";
import { emitir } from "../../../../componentes/eventos/pubsub.ts";
import { Tabla } from "../../../../componentes/wrappers/tabla2.tsx";
import { LineaPresupuesto as Linea, LineaPresupuesto } from "../diseño.ts";
import { eventoCantidadLineaCambiada, eventoLineaBorrada } from "../dominio.ts";
import { camposLinea, deleteLinea, patchCantidadLinea } from "../infraestructura.ts";

const EditarCantidad = ({
    linea,
    onCantidadEditada,
  }: {
    linea: Linea;
    onCantidadEditada: (linea: Linea, cantidad: number) => void;
  }) => {
    return (
      <InputNumerico
        campo={camposLinea.cantidad}
        onCampoCambiado={(_, valor) => onCantidadEditada(linea, valor)}
        valorEntidad={linea.cantidad}
      />
    );
  }

const getMetaTablaLineas = (cambiarCantidad: (linea: Linea, cantidad: number) => void) => {
    return [
        { id: "linea", cabecera: "Línea", render: (linea: Linea) => `${linea.referencia}: ${linea.descripcion}` },
        { id: "cantidad", cabecera: "Cantidad", render: (linea: Linea) => EditarCantidad({
            linea,
            onCantidadEditada: cambiarCantidad
        })},
        { id: "pvp_unitario", cabecera: "P. Unitario" },
        { id: "pvp_total", cabecera: "Total" },
    ]
}


export const LineasLista = ({
    cargando,
    // onLineaBorrada,
    // onLineaCambiada,
    // setLineas,
    presupuestoId,
    onEditarLineaClicked,
    onCrearLineaClicked,
    lineas,
    seleccionada,
    setSeleccionada,
  }: {
    cargando: boolean;
    // onLineaBorrada: () => void;
    // onLineaCambiada: (linea: Linea) => void;
    // setLineas: (lineas: Linea[]) => void;
    presupuestoId: string;
    onEditarLineaClicked: (linea: Linea) => void;
    onCrearLineaClicked: () => void;
    lineas: Linea[];
    seleccionada: Linea | null;
    setSeleccionada: (linea: Linea | null) => void;
  }) => {

    // const [cargando, setCargando] = useState(true);

    const borrarLinea = async(linea: LineaPresupuesto) => {
        // setLineas(quitarElemento(lineas, linea));
        await deleteLinea(presupuestoId, linea.id);
        emitir(eventoLineaBorrada(linea));
        // onLineaBorrada();
    }

    const cambiarCantidad = async(linea: Linea, cantidad: number) => {
        await patchCantidadLinea(presupuestoId, linea.id, cantidad);
        // onLineaCambiada(linea);
        emitir(eventoCantidadLineaCambiada(linea, cantidad));
    }

    // const quitarElemento = <T extends Entidad>(lista: T[], elemento: T): T[] => {
    //     return lista.filter((e) => e.id !== elemento.id);
    // }

    // const cargar = useCallback(async() => {
    //     setCargando(true);
    //     const lineas = await getLineas(presupuestoId);
    //     setLineas(lineas);
    //     refrescarSeleccionada(lineas, seleccionada?.id, setSeleccionada);
    //     setCargando(false);
    // }, [presupuestoId, setLineas, seleccionada?.id, setSeleccionada]);

    // useEffect(() => {
    //     if (presupuestoId) cargar();
    // }, [presupuestoId, cargar]);
    
    return (<>
            <button
                onClick={onCrearLineaClicked}
            > Nueva
            </button>
            <button
                onClick={() => seleccionada && onEditarLineaClicked(seleccionada)}
                disabled={!seleccionada}
            > Editar
            </button>
            <button
                disabled={!seleccionada}
                onClick={() => seleccionada && borrarLinea(seleccionada)}
            > Borrar
            </button>
           
            <Tabla
                metaTabla={getMetaTablaLineas(cambiarCantidad)}
                datos={lineas}
                cargando={cargando}
                seleccionadaId={seleccionada?.id}
                onSeleccion={setSeleccionada}
                orden={{ id: 'ASC'}}
                onOrdenar={(_: string) =>
                    null
                //   setOrden({ [clave]: orden[clave] === "ASC" ? "DESC" : "ASC" })
                }
            />
    </>)
  }