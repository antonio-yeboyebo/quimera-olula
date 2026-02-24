import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useLista } from "@olula/lib/useLista.ts";
import { Maquina, useMaquina } from "@olula/lib/useMaquina.ts";
import { useContext, useEffect, useState } from "react";
import { Evento } from "../diseño.ts";
import { getEvento, getEventos, patchEvento } from "../infraestructura.ts";
import { AltaEvento } from "./AltaEvento.tsx";
import "./MaestroEvento.css";
import { getMetaTablaEvento } from "./metaTablaEvento.tsx";

// Define Estado type for use in MaestroEvento
type Estado = "lista" | "alta";

export const MaestroEvento = () => {
  const [estado, setEstado] = useState<Estado>("lista");
  const eventos = useLista<Evento>([]);
  const { intentar } = useContext(ContextoError);
  const [paginacion, setPaginacion] = useState({ pagina: 1, limite: 9 });
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Cargar eventos al montar el componente
  useEffect(() => {
    const fetchEventos = async () => {
      const respuesta = await getEventos([], ["finicio", "DESC"], paginacion);
      eventos.setLista(respuesta.datos);
      if (respuesta.total && respuesta.total > 0) {
        setTotalRegistros(respuesta.total);
      }
    };
    fetchEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginacion]);

  // Definir la máquina de estados
  const maquina: Maquina<Estado> = {
    alta: {
      EVENTO_CREADO: (payload: unknown) => {
        const evento = payload as Evento;
        eventos.añadir(evento);
        return "lista";
      },
      ALTA_CANCELADA: "lista",
    },
    lista: {
      ALTA_INICIADA: "alta",
      EVENTO_CAMBIADO: (payload: unknown) => {
        const evento = payload as Evento;
        eventos.modificar(evento);
      },
      EVENTO_BORRADO: (payload: unknown) => {
        const evento = payload as Evento;
        eventos.eliminar(evento);
      },
      CANCELAR_SELECCION: () => {
        eventos.limpiarSeleccion();
      },
    },
  };

  const emitir = useMaquina(maquina, estado, setEstado);

  // Función para actualizar un evento en la lista local
  const init = (evento: Evento) => {
    eventos.modificar(evento);
  };

  // Manejador para cambios en campos booleanos
  const campoEventoChanged = async (eventoActualizado: Evento) => {
    await intentar(() =>
      patchEvento(eventoActualizado.evento_id, eventoActualizado)
    );
    const evento_guardado = await getEvento(eventoActualizado.evento_id);
    init(evento_guardado);
    emitir("EVENTO_CAMBIADO", evento_guardado);
  };

  return (
    <div className="Evento">
      <div className="cabecera-maestro">
        <h2>Eventos</h2>
        <QBoton onClick={() => emitir("ALTA_INICIADA")}>Nuevo</QBoton>
      </div>

      <QTabla
        metaTabla={getMetaTablaEvento(campoEventoChanged)}
        datos={eventos.lista}
        cargando={false}
        seleccionadaId={eventos.seleccionada?.evento_id}
        orden={["id", "ASC"]}
        onOrdenar={() => null}
        paginacion={paginacion}
        onPaginacion={(pagina, limite) => setPaginacion({ pagina, limite })}
        totalEntidades={totalRegistros}
      />

      {estado === "alta" && (
        <QModal
          nombre="modal"
          abierto={estado === "alta"}
          onCerrar={() => emitir("ALTA_CANCELADA")}
        >
          <AltaEvento emitir={emitir} />
        </QModal>
      )}
    </div>
  );
};
