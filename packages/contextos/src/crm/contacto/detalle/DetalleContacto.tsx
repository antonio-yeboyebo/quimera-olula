import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarContacto } from "../borrar/BorrarContacto.tsx";
import { Acciones } from "./acciones/Acciones.tsx";
import { contactoVacio, metaContacto } from "./detalle.ts";
import "./DetalleContacto.css";
import { getMaquina } from "./maquina.ts";
import { Oportunidades } from "./oportunidades/Oportunidades.tsx";
import { TabClientes } from "./tabs/TabClientes.tsx";
import { TabGeneral } from "./tabs/TabGeneral.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const DetalleContacto = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const params = useParams();

  const contactoId = id ?? params.id;
  const titulo = (contacto: Entidad) => contacto.nombre as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      contacto: contactoVacio,
    },
    publicar
  );

  const contacto = useModelo(metaContacto, ctx.contacto);
  const { modelo, modificado, valido } = contacto;

  useEffect(() => {
    if (contactoId) {
      emitir("contacto_id_cambiado", contactoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactoId]);

  return (
    <Detalle
      id={contactoId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_contacto_cancelada", null)}
    >
      {!!contactoId && (
        <div className="DetalleContacto">
          <QuimeraAcciones
            vertical
            acciones={[
              {
                texto: t("contacto.borrar"),
                onClick: () => emitir("borrado_contacto_solicitado"),
                advertencia: true,
              },
            ]}
          />

          <Tabs>
            <Tab label={t("contacto.general")}>
              <TabGeneral contacto={contacto} />
            </Tab>

            <Tab label={t("contacto.clientes")}>
              <TabClientes contacto={contacto} />
            </Tab>

            <Tab label={t("contacto.oportunidades")}>
              <Oportunidades contacto={contacto} />
            </Tab>

            <Tab label={t("contacto.acciones")}>
              <Acciones contacto={contacto} />
            </Tab>
          </Tabs>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("contacto_cambiado", modelo)}
                deshabilitado={!valido}
              >
                {t("contacto.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_contacto_cancelada")}
              >
                {t("contacto.cancelar")}
              </QBoton>
            </div>
          )}
          {ctx.estado === "BORRANDO" && (
            <BorrarContacto publicar={emitir} contacto={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
