import { QBoton } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { DirCliente } from "../../diseño.ts";
import {
  metaTablaDirecciones,
  puedoMarcarDireccionEnvio,
  puedoMarcarDireccionFacturacion,
} from "./dominio.ts";
import { useTVentas } from "../../../i18n/index.ts";
import { TarjetaDireccion } from "./TarjetaDireccion.tsx";
import "./TabDirecciones.css";

export const TabDireccionesLista = ({
  direcciones,
  seleccionada,
  emitir,
  cargando,
}: {
  clienteId: string;
  direcciones: DirCliente[];
  seleccionada: DirCliente | null;
  emitir: (evento: string, payload?: unknown) => void;
  cargando: boolean;
}) => {
  const t = useTVentas();
  const acciones = [
    {
      icono: "eliminar",
      texto: t("cliente.botones.borrar"),
      advertencia: true,
      onClick: () => seleccionada && emitir("borrado_solicitado"),
      deshabilitado: !seleccionada,
    },
    {
      texto: t("cliente.direccion.facturacion"),
      onClick: () => seleccionada && emitir("facturacion_solicitada"),
      deshabilitado:
        !seleccionada || !puedoMarcarDireccionFacturacion(seleccionada),
    },
    {
      texto: t("cliente.direccion.envio"),
      onClick: () => seleccionada && emitir("envio_solicitada"),
      deshabilitado: !seleccionada || !puedoMarcarDireccionEnvio(seleccionada),
    },
  ];

  return (
    <ListadoSemiControlado
      metaTabla={metaTablaDirecciones()}
      tarjeta={TarjetaDireccion}
      entidades={direcciones}
      totalEntidades={direcciones.length}
      cargando={cargando}
      seleccionada={seleccionada}
      onSeleccion={(direccion) => emitir("direccion_seleccionada", direccion)}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      renderAcciones={() => (
        <div className="TabDireccionesLista maestro-botones">
          <QBoton onClick={() => emitir("alta_solicitada")}>{t("cliente.botones.nueva")}</QBoton>
          <QBoton
            variante="borde"
            deshabilitado={!seleccionada}
            onClick={() => seleccionada && emitir("edicion_solicitada")}
          >
            {t("cliente.botones.editar")}
          </QBoton>
          <QuimeraAcciones acciones={acciones} vertical />
        </div>
      )}
    />
  );
};
