import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { conEmpresaActual } from "#/valores/empresaActual.ts";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { getCliente, postCliente } from "../infraestructura.ts";
import "./CrearCliente.css";
import { useTVentas } from "../../i18n/index.ts";
import { opcionesTipoVia } from "../crear_direccion/dominio.ts";
import { metaNuevoCliente, nuevoClienteVacio } from "./dominio.ts";

interface CrearClienteProps {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
}

export const CrearCliente = ({
  publicar = async () => {},
  onCancelar = () => {},
}: CrearClienteProps) => {
  const t = useTVentas();
  /* Lazy initializer: referencia estable para useModelo y empresa ya puesta en el
     primer render. */
  const [inicial] = useState(() => conEmpresaActual(nuevoClienteVacio));
  const nuevoCliente = useModelo(metaNuevoCliente, inicial);
  const [mostrarDireccion, setMostrarDireccion] = useState(false);
  const [mostrarErrorNombreVia, setMostrarErrorNombreVia] = useState(false);
  const [mostrarErrorCiudad, setMostrarErrorCiudad] = useState(false);
  const direccion = nuevoCliente.subModelo("direccion");

  const opciones = opcionesTipoVia();

  const guardar_ = useCallback(async () => {
    const id = await postCliente(nuevoCliente.modelo);
    nuevoCliente.init(conEmpresaActual(nuevoClienteVacio));
    const clienteCreado = await getCliente(id);
    publicar("cliente_creado", clienteCreado);
    onCancelar();
  }, [nuevoCliente, publicar, onCancelar]);

  const cancelar_ = useCallback(() => onCancelar(), [onCancelar]);

  const [guardar, cancelar] = useForm(guardar_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="crear_cliente"
      titulo={t("cliente.crear.titulo")}
      onCerrar={cancelar}
    >
      <>
        <quimera-formulario>
          <QInput
            label={t("cliente.campos.nombre")}
            autoSeleccion={true}
            {...nuevoCliente.uiProps("nombre")}
          />

          <TipoIdFiscal {...nuevoCliente.uiProps("tipo_id_fiscal")} />

          <QInput label={t("cliente.crear.idFiscal")} {...nuevoCliente.uiProps("id_fiscal")} />
        </quimera-formulario>
        {!nuevoCliente.modelo.empresa_id && (
          <QAviso>
            {t("cliente.crear.sinEmpresa")}
          </QAviso>
        )}

        {!mostrarDireccion ? (
          <QBoton
            variante="texto"
            onClick={() => {
              nuevoCliente.set({
                ...nuevoCliente.modelo,
                direccion: {
                  nombre_via: "",
                  tipo_via: "",
                  numero: "",
                  otros: "",
                  cod_postal: "",
                  ciudad: "",
                  provincia: "",
                  pais_id: "",
                  apartado: "",
                  telefono: "",
                },
              });
              setMostrarDireccion(true);
            }}
          >
            {t("cliente.crear.anadirDireccion")}
          </QBoton>
        ) : (
          <QBoton
            variante="texto"
            onClick={() => {
              const { direccion: _direccion, ...clienteSinDireccion } = nuevoCliente.modelo;
              nuevoCliente.set(clienteSinDireccion);
              setMostrarDireccion(false);
            }}
          >
            {t("cliente.crear.quitarDireccion")}
          </QBoton>
        )}

        {mostrarDireccion && (
          <quimera-formulario>
            <QSelect
              label={t("cliente.direccion.tipoVia")}
              opciones={opciones}
              {...direccion.uiProps("tipo_via")}
            />

            <QInput
              label={t("cliente.direccion.nombreVia")}
              {...direccion.uiProps("nombre_via")}
              textoValidacion={
                mostrarErrorNombreVia
                  ? direccion.uiProps("nombre_via").textoValidacion
                  : ""
              }
              onChange={(valor) => {
                direccion.uiProps("nombre_via").onChange(valor);
                setMostrarErrorNombreVia(true);
              }}
            />

            <QInput label={t("cliente.direccion.numero")} {...direccion.uiProps("numero")} />

            <QInput
              label={t("cliente.direccion.otrosDetalle")}
              {...direccion.uiProps("otros")}
            />

            <QInput
              label={t("cliente.direccion.ciudad")}
              {...direccion.uiProps("ciudad")}
              textoValidacion={
                mostrarErrorCiudad
                  ? direccion.uiProps("ciudad").textoValidacion
                  : ""
              }
              onChange={(valor) => {
                direccion.uiProps("ciudad").onChange(valor);
                setMostrarErrorCiudad(true);
              }}
            />

            <QInput
              label={t("cliente.direccion.codPostalLargo")}
              {...direccion.uiProps("cod_postal")}
            />

            <QInput label={t("cliente.direccion.provincia")} {...direccion.uiProps("provincia")} />

            <QInput label={t("cliente.direccion.pais")} {...direccion.uiProps("pais_id")} />

            <QInput
              label={t("cliente.direccion.apartadoLargo")}
              {...direccion.uiProps("apartado")}
            />

            <QInput label={t("cliente.direccion.telefono")} {...direccion.uiProps("telefono")} />
          </quimera-formulario>
        )}

        <div className="botones">
          <QBoton
            onClick={guardar}
            deshabilitado={nuevoCliente.valido === false}
          >
            {t("cliente.botones.guardar")}
          </QBoton>

          <QBoton tipo="reset" variante="texto" onClick={cancelar}>
            {t("cliente.botones.cancelar")}
          </QBoton>
        </div>
      </>
    </QModal>
  );
};
