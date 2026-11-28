import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { postDireccion } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";
import { metaNuevaDireccion, nuevaDireccionVacia } from "./dominio.ts";

export const CrearDireccion = ({
  clienteId,
  publicar,
}: {
  clienteId: string;
  publicar: ProcesarEvento;
}) => {
  const t = useTVentas();
  const { intentar } = useContext(ContextoError);
  const { modelo, uiProps, valido, set } = useModelo(
    metaNuevaDireccion,
    nuevaDireccionVacia
  );
  const [creando, setCreando] = useState(false);
  const focus = useFocus();

  const guardar = useCallback(async () => {
    await intentar(() => postDireccion(clienteId, modelo));
    setCreando(true);
    publicar("direccion_creada");
  }, [modelo, publicar, clienteId, intentar]);

  const cancelar = useCallback(() => {
    if (!creando) publicar("alta_cancelada");
  }, [creando, publicar]);

  return (
    <div className="CrearDireccion">
      <quimera-formulario>
        <QInput label={t("cliente.direccion.tipoVia")} {...uiProps("tipo_via")} ref={focus} />
        <QInput label={t("cliente.direccion.nombreVia")} {...uiProps("nombre_via")} />
        <QInput label={t("cliente.direccion.numero")} {...uiProps("numero")} />
        <QInput label={t("cliente.direccion.otros")} {...uiProps("otros")} />
        <QInput label={t("cliente.direccion.apartado")} {...uiProps("apartado")} />
        <QInput label={t("cliente.direccion.codPostal")} {...uiProps("cod_postal")} />
        <QInput label={t("cliente.direccion.ciudad")} {...uiProps("ciudad")} />
        <QInput label={t("cliente.direccion.provincia")} {...uiProps("provincia")} />
        <PaisSelector
          label={t("cliente.direccion.pais")}
          nombre="direccion/pais_id"
          valor={modelo.pais_id}
          onChange={(opcion) =>
            set({ ...modelo, pais_id: opcion?.valor ?? "" })
          }
        />
        <QInput label={t("cliente.direccion.telefono")} {...uiProps("telefono")} />
      </quimera-formulario>
      <div className="botones maestro-botones">
        <QBoton onClick={guardar} deshabilitado={!valido}>
          {t("cliente.botones.guardar")}
        </QBoton>
        <QBoton tipo="reset" variante="texto" onClick={cancelar}>
          {t("cliente.botones.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
