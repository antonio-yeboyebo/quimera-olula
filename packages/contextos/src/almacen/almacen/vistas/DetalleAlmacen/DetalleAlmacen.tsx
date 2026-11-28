import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.ts";
import { ConfigMaquina4, useMaquina4 } from "@olula/lib/useMaquina.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useMemo } from "react";
import { useParams } from "react-router";
import { Almacen } from "../../diseño.ts";
import {
  almacenLocal,
  getAlmacen,
  patchAlmacen,
} from "../../infraestructura.ts";
import { BorrarAlmacen } from "../detalle/BorrarAlmacen.tsx";
import { almacenVacio, metaAlmacen } from "../detalle/dominio.ts";
import "./DetalleAlmacen.css";
import { useTAlmacen } from "../../../i18n/index.ts";

type Estado = "Editando" | "Borrando";
type Contexto = Record<string, unknown>;
const configMaquina: ConfigMaquina4<Estado, Contexto> = {
  inicial: {
    estado: "Editando",
    contexto: {},
  },
  estados: {
    Editando: {
      borrar: "Borrando",
      almacen_guardado: ({ publicar }) => publicar("almacen_guardado"),
      cancelar_seleccion: ({ publicar }) => publicar("seleccion_cancelada"),
    },
    Borrando: {
      borrado_cancelado: "Editando",
      almacen_borrado: ({ publicar }) => publicar("almacen_borrado"),
    },
  },
};

const titulo = (almacen: Entidad) => almacen.descripcion as string;

export const DetalleAlmacen = ({
  almacenInicial = null,
  publicar = async () => {},
}: {
  almacenInicial?: Almacen | null;
  publicar?: EmitirEvento;
}) => {
  const t = useTAlmacen();
  const params = useParams();
  const { intentar } = useContext(ContextoError);

  // useModelo reinicia el modelo cuando cambia la identidad del inicial, así que
  // crearlo en cada render entra en bucle y borra lo escrito.
  const inicial = useMemo(almacenVacio, []);

  const almacen = useModelo(metaAlmacen, inicial);
  const { modelo, uiProps, init } = almacen;

  const guardar = async () => {
    await intentar(() => patchAlmacen(modelo.id, modelo));
    recargarCabecera();
    emitir("almacen_guardado");
  };

  const cancelar = () => {
    init();
  };

  const [emitir, { estado }] = useMaquina4<Estado, Contexto>({
    config: configMaquina,
    publicar,
  });

  const recargarCabecera = async () => {
    const nuevaAlmacen = await intentar(() => getAlmacen(modelo.id));
    init(nuevaAlmacen);
    publicar("almacen_cambiado", nuevaAlmacen);
  };

  const almacenId = almacenInicial?.id ?? params.id;

  const actualizaAlmacenLocal = async () => {
    const actual = almacenLocal.obtener();
    console.log("Almacén local actual:", actual);
    almacenLocal.actualizar({ id: modelo.id, nombre_almacen: modelo.nombre });
  };

  return (
    <Detalle
      id={almacenId}
      obtenerTitulo={titulo}
      setEntidad={(accionInicial) => init(accionInicial)}
      entidad={modelo}
      cargar={getAlmacen}
      cerrarDetalle={() => publicar("seleccion_cancelada")}
    >
      {!!almacenId && (
        <>
          <div className="maestro-botones ">
            <QBoton onClick={() => emitir("borrar")}>{t("almacen.borrar")}</QBoton>
            <QBoton onClick={() => actualizaAlmacenLocal()}>
              {t("almacen.almacenLocal")}
            </QBoton>
          </div>
          <div className="DetalleAlmacen">
            <Tabs
              children={[
                <Tab key="general" label={t("almacen.general")}>
                  <quimera-formulario>
                    <QInput label={t("almacen.codigo")} {...uiProps("id")} />
                    <QInput label={t("almacen.nombre")} {...uiProps("nombre")} />
                  </quimera-formulario>
                </Tab>,
              ]}
            ></Tabs>
          </div>
          {almacen.modificado && (
            <div className="botones maestro-botones">
              <QBoton onClick={guardar} deshabilitado={!almacen.valido}>
                {t("almacen.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={cancelar}
                deshabilitado={!almacen.modificado}
              >
                {t("almacen.cancelar")}
              </QBoton>
            </div>
          )}
          <BorrarAlmacen
            publicar={emitir}
            activo={estado === "Borrando"}
            almacen={modelo}
          />
        </>
      )}
    </Detalle>
  );
};
