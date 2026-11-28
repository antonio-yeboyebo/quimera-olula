import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { plugin } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { useParams } from "react-router";
import { Almacen } from "../../diseño.ts";
import { almacenLocal, patchAlmacen } from "../../infraestructura.ts";
import { BorrarAlmacen } from "./BorrarAlmacen.tsx";
import "./DetalleAlmacen.css";
import { almacenVacio, metaAlmacen } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

const titulo = (almacen: Almacen) => almacen.nombre as string;

export const DetalleAlmacen = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTAlmacen();
  const params = useParams();
  const almacenId = id ?? params.id;
  const { intentar } = useContext(ContextoError);

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      almacen: almacenVacio(),
      almacenInicial: almacenVacio(),
    },
    publicar
  );

  const almacen = useModelo(metaAlmacen, ctx.almacen);
  const pluginMultiAlmacenActivo = plugin("multi_almacen") === "activo";
  const mostrarCambiarAlmacen = pluginMultiAlmacenActivo || true;

  useEffect(() => {
    emitir("almacen_id_cambiado", almacenId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [almacenId]);

  const handleGuardar = useCallback(async () => {
    await intentar(() => patchAlmacen(almacen.modelo.id, almacen.modelo));
    emitir("almacen_guardado");
  }, [emitir, almacen, intentar]);

  const handleCancelar = useCallback(() => {
    emitir("cancelar_edicion");
  }, [emitir]);

  const handleCambiarAlmacenLocal = useCallback(() => {
    if (!ctx.almacen.id) return;
    almacenLocal.actualizar({
      id: ctx.almacen.id,
      nombre_almacen: ctx.almacen.nombre,
    });
  }, [ctx.almacen.id, ctx.almacen.nombre]);

  if (!ctx.almacen.id) return;

  return (
    <Detalle
      id={ctx.almacen.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.almacen}
      cerrarDetalle={() => emitir("cancelar_seleccion")}
    >
      {!!ctx.almacen.id && (
        <>
          <div className="maestro-botones ">
            <QBoton onClick={() => emitir("borrar")}>{t("almacen.borrar")}</QBoton>
            {mostrarCambiarAlmacen && (
              <QBoton onClick={handleCambiarAlmacenLocal}>
                {t("almacen.cambiarAlmacen")}
              </QBoton>
            )}
          </div>
          <div className="DetalleAlmacen">
            <Tabs
              children={[
                <Tab key="general" label={t("almacen.general")}>
                  <quimera-formulario>
                    <QInput label={t("almacen.codigo")} {...almacen.uiProps("id")} />
                    <QInput label={t("almacen.nombre")} {...almacen.uiProps("nombre")} />
                  </quimera-formulario>
                </Tab>,
              ]}
            ></Tabs>
          </div>
          {almacen.modificado && (
            <div className="botones maestro-botones">
              <QBoton onClick={handleGuardar} deshabilitado={!almacen.valido}>
                {t("almacen.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={handleCancelar}
                deshabilitado={!almacen.modificado}
              >
                {t("almacen.cancelar")}
              </QBoton>
            </div>
          )}
          <BorrarAlmacen
            publicar={emitir}
            activo={ctx.estado === "Borrando"}
            almacen={ctx.almacen}
          />
        </>
      )}
    </Detalle>
  );
};
