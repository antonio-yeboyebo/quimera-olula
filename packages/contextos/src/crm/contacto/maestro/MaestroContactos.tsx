import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearContacto } from "../crear/CrearContacto.tsx";
import { DetalleContacto } from "../detalle/DetalleContacto.tsx";
import { Contacto } from "../diseño.ts";
import { metaTablaContacto } from "./maestro.ts";
import "./MaestroContactos.css";
import { getMaquina } from "./maquina.ts";
import { TarjetaContacto } from "./TarjetaContacto.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const MaestroContactos = () => {
  const t = useTCrm();
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    contactos: listaActivaEntidadesInicial<Contacto>(id, criteria),
  });

  useUrlParams(ctx.contactos.activo, ctx.contactos.criteria);

  useEffect(() => {
    emitir("recarga_de_contactos_solicitada", ctx.contactos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Contacto">
      <MaestroDetalle<Contacto>
        Maestro={
          <>
            <h2>{t("contacto.contactos")}</h2>

            <Listado<Contacto>
              metaTabla={metaTablaContacto}
              criteria={ctx.contactos.criteria}
              modosDisponibles={["tarjetas"]}
              tarjeta={TarjetaContacto}
              entidades={ctx.contactos.lista}
              totalEntidades={ctx.contactos.total}
              seleccionada={ctx.contactos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("creacion_de_contacto_solicitada")}
                  >
                    {t("contacto.nuevo")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("contacto_seleccionado", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleContacto id={ctx.contactos.activo} publicar={emitir} />
        }
        seleccionada={ctx.contactos.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO" && <CrearContacto publicar={emitir} />}
    </div>
  );
};
