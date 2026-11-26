import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { DirCliente } from "../diseño.ts";
import { actualizarDireccion } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";
import { opcionesTipoVia } from "../crear_direccion/dominio.ts";
import { metaDireccion } from "./dominio.ts";

export const CambiarDireccion = ({
  direccion,
  clienteId,
  publicar,
}: {
  direccion: DirCliente;
  clienteId: string;
  publicar: ProcesarEvento;
}) => {
  const t = useTVentas();
  const direccionEditada = useModelo(metaDireccion, direccion);
  const focus = useFocus();

  const guardar_ = useCallback(async () => {
    await actualizarDireccion(clienteId, direccionEditada.modelo);
    publicar("direccion_actualizada");
  }, [direccionEditada.modelo, publicar, clienteId]);

  const cancelar_ = useCallback(
    () => publicar("edicion_cancelada"),
    [publicar]
  );

  const [guardar, cancelar] = useForm(guardar_, cancelar_);

  const opciones = opcionesTipoVia();

  return (
    <div className="EdicionDireccion">
      <quimera-formulario>
        <div style={{ gridColumn: "span 2" }}>
          <QSelect
            label={t("cliente.direccion.tipoVia")}
            opciones={opciones}
            {...direccionEditada.uiProps("tipo_via")}
            ref={focus}
          />
        </div>
        <div style={{ gridColumn: "span 7" }}>
          <QInput
            label={t("cliente.direccion.nombreVia")}
            {...direccionEditada.uiProps("nombre_via")}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <QInput label={t("cliente.direccion.numero")} {...direccionEditada.uiProps("numero")} />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <QInput label={t("cliente.direccion.otros")} {...direccionEditada.uiProps("otros")} />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <QInput
            label={t("cliente.direccion.apartado")}
            {...direccionEditada.uiProps("apartado")}
          />
        </div>
        <div style={{ gridColumn: "span 3" }}>
          <QInput
            label={t("cliente.direccion.codPostal")}
            {...direccionEditada.uiProps("cod_postal")}
          />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <QInput label={t("cliente.direccion.ciudad")} {...direccionEditada.uiProps("ciudad")} />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <QInput label={t("cliente.direccion.provincia")} {...direccionEditada.uiProps("provincia")} />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <PaisSelector
            label={t("cliente.direccion.pais")}
            nombre="direccion/pais_id"
            valor={direccionEditada.modelo.pais_id}
            onChange={(opcion) =>
              direccionEditada.set({
                ...direccionEditada.modelo,
                pais_id: opcion?.valor ?? "",
              })
            }
          />
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <QInput label={t("cliente.direccion.telefono")} {...direccionEditada.uiProps("telefono")} />
        </div>
      </quimera-formulario>
      <div className="botones maestro-botones">
        <QBoton deshabilitado={!direccionEditada.valido} onClick={guardar}>
          {t("cliente.botones.guardar")}
        </QBoton>
        <QBoton tipo="reset" variante="texto" onClick={cancelar}>
          {t("cliente.botones.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
