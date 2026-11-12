import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
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
import { metaNuevoCliente, nuevoClienteVacio } from "./dominio.ts";

interface CrearClienteProps {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
}

export const CrearCliente = ({
  publicar = async () => {},
  onCancelar = () => {},
}: CrearClienteProps) => {
  const nuevoCliente = useModelo(metaNuevoCliente, nuevoClienteVacio);
  const [mostrarDireccion, setMostrarDireccion] = useState(false);
  const [mostrarErrorNombreVia, setMostrarErrorNombreVia] = useState(false);
  const [mostrarErrorCiudad, setMostrarErrorCiudad] = useState(false);
  const direccion = nuevoCliente.subModelo("direccion");

  const opciones = [
    { valor: "Calle", descripcion: "Calle" },
    { valor: "Avenida", descripcion: "Avenida" },
    { valor: "Plaza", descripcion: "Plaza" },
    { valor: "Paseo", descripcion: "Paseo" },
    { valor: "Camino", descripcion: "Camino" },
    { valor: "Carretera", descripcion: "Carretera" },
  ];

  const guardar_ = useCallback(async () => {
    const id = await postCliente(nuevoCliente.modelo);
    nuevoCliente.init(nuevoClienteVacio);
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
      titulo="Nuevo Cliente"
      onCerrar={cancelar}
    >
      <>
        <quimera-formulario>
          <QInput
            label="Nombre"
            autoSeleccion={true}
            {...nuevoCliente.uiProps("nombre")}
          />

          <TipoIdFiscal {...nuevoCliente.uiProps("tipo_id_fiscal")} />

          <QInput label="ID Fiscal" {...nuevoCliente.uiProps("id_fiscal")} />
        </quimera-formulario>

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
            Añadir dirección
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
            Quitar dirección
          </QBoton>
        )}

        {mostrarDireccion && (
          <quimera-formulario>
            <QSelect
              label="Tipo de Vía"
              opciones={opciones}
              {...direccion.uiProps("tipo_via")}
            />

            <QInput
              label="Nombre de vía"
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

            <QInput label="Número" {...direccion.uiProps("numero")} />

            <QInput
              label="Otros (piso, puerta...)"
              {...direccion.uiProps("otros")}
            />

            <QInput
              label="Ciudad"
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
              label="Código postal"
              {...direccion.uiProps("cod_postal")}
            />

            <QInput label="Provincia" {...direccion.uiProps("provincia")} />

            <QInput label="País" {...direccion.uiProps("pais_id")} />

            <QInput
              label="Apartado de correos"
              {...direccion.uiProps("apartado")}
            />

            <QInput label="Teléfono" {...direccion.uiProps("telefono")} />
          </quimera-formulario>
        )}

        <div className="botones">
          <QBoton
            onClick={guardar}
            deshabilitado={nuevoCliente.valido === false}
          >
            Guardar
          </QBoton>

          <QBoton tipo="reset" variante="texto" onClick={cancelar}>
            Cancelar
          </QBoton>
        </div>
      </>
    </QModal>
  );
};
