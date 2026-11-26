import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { PesoMedida } from "#/almacen/comun/componentes/PesoMedida.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { plugin } from "@olula/lib/dominio.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { NuevaFamilia } from "../diseño.ts";
import { metaNuevaFamilia, nuevaFamiliaVacia } from "../dominio.ts";
import { getFamilia, postFamilia } from "../infraestructura.ts";
import "./CrearFamilia.css";
import { useTAlmacen } from "../../i18n/index.ts";

export const CrearFamilia = ({
  publicar = async () => {},
  activo = false,
}: {
  publicar?: ProcesarEvento;
  activo: boolean;
}) => {
  const familia = useModelo(metaNuevaFamilia, nuevaFamiliaVacia);

  const cancelar = () => {
    familia.init();
    publicar("creacion_cancelada");
  };

  return (
    <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
      <FormAltaFamilia publicar={publicar} familia={familia} />
    </Mostrar>
  );
};

const FormAltaFamilia = ({
  publicar = async () => {},
  familia,
}: {
  publicar?: ProcesarEvento;
  familia: HookModelo<NuevaFamilia>;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const crear = async () => {
    const modelo = {
      ...familia.modelo,
    };
    const id = await intentar(() => postFamilia(modelo));
    const familiaCreada = await getFamilia(id);
    publicar("familia_creada", familiaCreada);
    familia.init();
  };

  const cancelar = () => {
    publicar("creacion_cancelada");
    familia.init();
  };

  return (
    <div className="CrearFamilia">
      <h2>{t("familia.nuevaFamilia")}</h2>
      <quimera-formulario>
        <QInput label={t("familia.codigoFamilia")} {...familia.uiProps("id")} />
        <QInput label={t("familia.descripcion")} {...familia.uiProps("descripcion")} />
        {plugin("pesos_medidas") === "activo" && (
          <PesoMedida {...familia.uiProps("unidadId")} />
        )}
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!familia.valido}>
          {t("familia.guardar")}
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          {t("familia.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
