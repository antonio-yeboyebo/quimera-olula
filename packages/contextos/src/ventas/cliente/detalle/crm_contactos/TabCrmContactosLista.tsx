import { QBoton } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { CrmContacto } from "../../diseño.ts";
import { metaTablaCrmContactos } from "./dominio.ts";
import { useTVentas } from "../../../i18n/index.ts";
import { TarjetaCrmContacto } from "./TarjetaCrmContacto.tsx";

export const TabCrmContactosLista = ({
  contactos,
  seleccionado,
  emitir,
  cargando,
  acciones,
}: {
  contactos: CrmContacto[];
  seleccionado: CrmContacto | null;
  emitir: (evento: string, payload?: unknown) => void;
  cargando: boolean;
  acciones: Parameters<typeof QuimeraAcciones>[0]["acciones"];
}) => {
  const t = useTVentas();
  return (
    <div className="CrmContactos">
      <ListadoSemiControlado
        metaTabla={metaTablaCrmContactos()}
        tarjeta={TarjetaCrmContacto}
        modoInicial="tabla"
        modosDisponibles={["tabla"]}
        entidades={contactos}
        totalEntidades={contactos.length}
        cargando={cargando}
        seleccionada={seleccionado}
        onSeleccion={(contacto) => emitir("contacto_seleccionado", contacto)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        renderAcciones={() => (
          <div className="detalle-cliente-tab-contenido maestro-botones">
            <QBoton onClick={() => emitir("alta_solicitada")}>{t("cliente.botones.nuevo")}</QBoton>
            <QBoton
              variante="borde"
              deshabilitado={!seleccionado}
              onClick={() => seleccionado && emitir("edicion_solicitada")}
            >
              {t("cliente.botones.editar")}
            </QBoton>
            <QuimeraAcciones acciones={acciones} vertical />
          </div>
        )}
      />
    </div>
  );
};
