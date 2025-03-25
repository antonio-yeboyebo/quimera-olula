import { useCallback, useEffect, useState } from "react";
import { useSuscribir } from "../../../../componentes/eventos/pubsub.ts";
import { quitarEntidadDeLista, refrescarSeleccionada } from "../../../comun/dominio.ts";
import { EventoCantidadLineaCambiada, EventoLineaBorrada, EventoLineaCreada, EventoReferenciaLineaCambiada, LineaPresupuesto as Linea } from "../diseño.ts";
import { CANTIDAD_LINEA_CAMBIADA, LINEA_BORRADA, LINEA_CREADA, REFERENCIA_LINEA_CAMBIADA } from "../dominio.ts";
import { getLineas } from "../infraestructura.ts";
import { AltaLinea } from "./AltaLinea.tsx";
import { EdicionLinea } from "./EdicionLinea.tsx";
import { LineasLista } from "./LineasLista.tsx";

type EventoLineaModificada = EventoCantidadLineaCambiada | EventoReferenciaLineaCambiada;

export const Lineas = ({
    // onCabeceraModificada,
    presupuestoId,
  }: {
    // onCabeceraModificada: () => void;
    presupuestoId: string;
  }) => {

    const [modo, setModo] = useState("lista");
    const [lineas, setLineas] = useState<Linea[]>([]);
    const [cargando, setCargando] = useState(true);
    const [seleccionada, setSeleccionada] = useState<Linea | null>(null);
    
    const actualizarLinea = async(e: EventoLineaModificada) => {
        const linea = e.payload.linea;
        const lineas = await getLineas(presupuestoId);
        setLineas(lineas)
        // onCabeceraModificada();
        refrescarSeleccionada(lineas, linea.id, setSeleccionada);
    }

    const añadirLinea = async (e: EventoLineaCreada) => {
        const lineas = await getLineas(presupuestoId);
        setLineas(lineas)
        // onCabeceraModificada();
        refrescarSeleccionada(lineas, e.payload.lineaId, setSeleccionada);
        setModo("lista");
    }

    const quitarLinea = async (e: EventoLineaBorrada) => {
        setLineas(quitarEntidadDeLista(lineas, e.payload.linea));
    }
    // const quitarElemento = <T extends Entidad>(lista: T[], elemento: T): T[] => {
    //     return lista.filter((e) => e.id !== elemento.id);
    // }

    useSuscribir([
        [REFERENCIA_LINEA_CAMBIADA, actualizarLinea],
        [CANTIDAD_LINEA_CAMBIADA, actualizarLinea],
        [LINEA_BORRADA, quitarLinea],
        [LINEA_CREADA, añadirLinea],
    ]);

    const cargar = useCallback(async() => {
        setCargando(true);
        const lineas = await getLineas(presupuestoId);
        setLineas(lineas);
        refrescarSeleccionada(lineas, seleccionada?.id, setSeleccionada);
        setCargando(false);
    }, [presupuestoId, setLineas, seleccionada?.id, setSeleccionada]);

    useEffect(() => {
        if (presupuestoId) cargar();
    }, [presupuestoId, cargar]);
    
    return (
        <>
            <LineasLista
                cargando={cargando}
                // onLineaBorrada={onCabeceraModificada}
                // onLineaCambiada={actualizarLinea}
                // setLineas={setLineas}
                presupuestoId={presupuestoId}
                onEditarLineaClicked={() => setModo("edicion")}
                onCrearLineaClicked={() => setModo("alta")}
                lineas={lineas}
                seleccionada={seleccionada}
                setSeleccionada={setSeleccionada}
            />
            { modo === "edicion" && seleccionada &&
                <EdicionLinea
                    presupuestoId={presupuestoId}
                    linea={seleccionada}
                    // onLineaActualizada={actualizarLinea}
                    onCancelada={() => setModo("lista")}
                />
            }
            { modo === "alta" &&
                <AltaLinea
                    presupuestoId={presupuestoId}
                    // onLineaCreada={añadirLinea}
                    onCancelada={() => setModo("lista")}
                />
            } 
        </>
    );
  }