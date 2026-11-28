import { PasilloZona } from "#/almacen/comun/componentes/PasilloZona.tsx";
import { TipoUbicacion } from "#/almacen/comun/componentes/TipoUbicacion.tsx";
import { Zona } from "#/almacen/comun/componentes/Zona.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { NuevaUbicacion } from "../../diseño.ts";
import { metaNuevaUbicacion, nuevaUbicacionVacia } from "../../dominio.ts";
import { getUbicacion, postUbicacion } from "../../infraestructura.ts";
import "./CrearUbicacion.css";
import { useTAlmacen } from "../../../i18n/index.ts";

export const CrearUbicacion = ({
  publicar = async () => {},
  activo = false,
}: {
  publicar?: ProcesarEvento;
  activo: boolean;
}) => {
  const ubicacion = useModelo(metaNuevaUbicacion, nuevaUbicacionVacia);

  const cancelar = () => {
    ubicacion.init();
    publicar("creacion_cancelada");
  };

  return (
    <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
      <FormAltaUbicacion publicar={publicar} ubicacion={ubicacion} />
    </Mostrar>
  );
};

const FormAltaUbicacion = ({
  publicar = async () => {},
  ubicacion,
}: {
  publicar?: ProcesarEvento;
  ubicacion: HookModelo<NuevaUbicacion>;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const crear = async () => {
    const modelo = {
      ...ubicacion.modelo,
    };
    const id = await intentar(() => postUbicacion(modelo));
    const ubicacionCreada = await getUbicacion(id);
    publicar("ubicacion_creada", ubicacionCreada);
    ubicacion.init();
  };

  const cancelar = () => {
    publicar("creacion_cancelada");
    ubicacion.init();
  };

  return (
    <div className="CrearUbicacion">
      <h2>{t("ubicacion.nuevaUbicacion")}</h2>
      <quimera-formulario>
        <QInput label={t("ubicacion.codigoVacioSiSeGeneraPor")} {...ubicacion.uiProps("codigo")} />
        <Zona {...ubicacion.uiProps("zonaId")} />
        <PasilloZona zonaId={ubicacion.modelo.zonaId} {...ubicacion.uiProps("pasilloId")} />
        <QInput label={t("ubicacion.modulo")} {...ubicacion.uiProps("modulo")} />
        <QInput label={t("ubicacion.nivel")} {...ubicacion.uiProps("nivel")} />
        <QInput label={t("ubicacion.hueco")} {...ubicacion.uiProps("hueco")} />
        <TipoUbicacion {...ubicacion.uiProps("tipoUbicacionId")} />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!ubicacion.valido}>
          {t("ubicacion.guardar")}
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          {t("ubicacion.cancelar")}
        </QBoton>
      </div>
    </div>
  );
};
