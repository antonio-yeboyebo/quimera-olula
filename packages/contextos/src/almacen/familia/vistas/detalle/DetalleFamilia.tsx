import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { PesoMedida } from "#/almacen/comun/componentes/PesoMedida.tsx";
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
import { Familia } from "../../diseño.ts";
import { patchFamilia } from "../../infraestructura.ts";
import { BorrarFamilia } from "./BorrarFamilia.tsx";
import "./DetalleFamilia.css";
import { familiaVacia, metaFamilia } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

const titulo = (familia: Familia) => familia.descripcion as string;

export const DetalleFamilia = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTAlmacen();
  const params = useParams();
  const familiaId = id ?? params.id;
  const { intentar } = useContext(ContextoError);

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      familia: familiaVacia(),
      familiaInicial: familiaVacia(),
    },
    publicar
  );

  const familia = useModelo(metaFamilia, ctx.familia);

  useEffect(() => {
    emitir("familia_id_cambiado", familiaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familiaId]);

  const guardar = useCallback(async () => {
    await intentar(() => patchFamilia(familia.modelo.id, familia.modelo));
    emitir("familia_guardada");
  }, [emitir, familia, intentar]);

  const cancelar = useCallback(() => {
    emitir("cancelar_edicion");
  }, [emitir]);

  if (!ctx.familia.id) return;

  return (
    <Detalle
      id={ctx.familia.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.familia}
      cerrarDetalle={() => emitir("cancelar_seleccion")}
    >
      {!!ctx.familia.id && (
        <>
          <div className="maestro-botones ">
            <QBoton onClick={() => emitir("borrar")}>{t("familia.borrar")}</QBoton>
          </div>
          <div className="DetalleFamilia">
            <Tabs
              children={[
                <Tab key="general" label={t("familia.general")}>
                  <quimera-formulario>
                    <QInput label={t("familia.codigo")} {...familia.uiProps("id")} />
                    <QInput
                      label={t("familia.descripcion")}
                      {...familia.uiProps("descripcion")}
                    />
                    {plugin("pesos_medidas") === "activo" && (
                      <PesoMedida {...familia.uiProps("unidadId")} />
                    )}
                  </quimera-formulario>
                </Tab>,
              ]}
            ></Tabs>
          </div>
          {familia.modificado && (
            <div className="botones maestro-botones">
              <QBoton onClick={guardar} deshabilitado={!familia.valido}>
                {t("familia.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={cancelar}
                deshabilitado={!familia.modificado}
              >
                {t("familia.cancelar")}
              </QBoton>
            </div>
          )}
          <BorrarFamilia
            publicar={emitir}
            activo={ctx.estado === "Borrando"}
            familia={ctx.familia}
          />
        </>
      )}
    </Detalle>
  );
};
