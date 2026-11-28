import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { NuevoAlmacen } from "../diseño.ts";
import { metaNuevoAlmacen, nuevoAlmacenVacio } from "../dominio.ts";
import { getAlmacen, postAlmacen } from "../infraestructura.ts";
import "./CrearAlmacen.css";
import { useTAlmacen } from "../../i18n/index.ts";

export const CrearAlmacen = ({
  publicar = async () => {},
  activo = false,
}: {
  publicar?: ProcesarEvento;
  activo: boolean;
}) => {
  const almacen = useModelo(metaNuevoAlmacen, nuevoAlmacenVacio);

  const cancelar = () => {
    almacen.init();
    publicar("creacion_cancelada");
  };

  return (
    <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
      <FormAltaAlmacen publicar={publicar} almacen={almacen} />
    </Mostrar>
  );
};

const FormAltaAlmacen = ({
  publicar = async () => {},
  almacen,
}: {
  publicar?: ProcesarEvento;
  almacen: HookModelo<NuevoAlmacen>;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const crear = async () => {
    const modelo = {
      ...almacen.modelo,
    };
    const id = await intentar(() => postAlmacen(modelo));
    const almacenCreada = await getAlmacen(id);
    publicar("almacen_creado", almacenCreada);
    almacen.init();
  };

  const cancelar = () => {
    publicar("creacion_cancelada");
    almacen.init();
  };

  return (
    <div className="CrearAlmacen">
      <h2>{t("almacen.nuevoAlmacen")}</h2>
      <quimera-formulario>
        <QInput label={t("almacen.codigoAlmacen")} {...almacen.uiProps("id")} />
        <QInput label={t("almacen.nombre")} {...almacen.uiProps("nombre")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!almacen.valido}>
          {t("almacen.guardar")}
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          {t("almacen.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
