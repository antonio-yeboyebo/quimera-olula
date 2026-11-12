import { opcionesTipoIdFiscalCompras } from "#/compras/comun/valores.ts";
import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { postProveedor } from "../infraestructura.ts";
import { metaNuevoProveedor, nuevoProveedorInicial } from "./crear.ts";
import "./CrearProveedor.css";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

export const CrearProveedor = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoProveedorInicial, []);

    const nuevoProveedor = useModelo(metaNuevoProveedor, inicial);
    const { modelo: proveedor, uiProps, valido } = nuevoProveedor;

    const [mostrarDireccion, setMostrarDireccion] = useState(false);
    const [mostrarErrorNombreVia, setMostrarErrorNombreVia] = useState(false);
    const [mostrarErrorCiudad, setMostrarErrorCiudad] = useState(false);

    const direccion = nuevoProveedor.subModelo("direccion");

    const crear_ = useCallback(async () => {
        const id = await postProveedor(proveedor);
        publicar("proveedor_creado", id);
    }, [proveedor, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_proveedor_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();

    const opcionesTipoVia = [
      { valor: "Calle", descripcion: "Calle" },
      { valor: "Avenida", descripcion: "Avenida" },
      { valor: "Plaza", descripcion: "Plaza" },
      { valor: "Paseo", descripcion: "Paseo" },
      { valor: "Camino", descripcion: "Camino" },
      { valor: "Carretera", descripcion: "Carretera" },
    ];

    return (
      <QModal
        abierto={true}
        nombre="crearProveedor"
        titulo="Crear proveedor"
        onCerrar={cancelar}
      >
        <div className="CrearProveedor">
          <quimera-formulario>
            <QInput label="Nombre" {...uiProps("nombre")} ref={focus} />
            <TipoIdFiscal
              {...uiProps("tipoIdFiscal")}
              opciones={opcionesTipoIdFiscalCompras}
            />
            <QInput label="Id Fiscal" {...uiProps("idFiscal")} />
          </quimera-formulario>

          {!mostrarDireccion ? (
            <QBoton
              variante="texto"
              onClick={() => {
                nuevoProveedor.set({
                  ...proveedor,
                  direccion: {
                    nombreVia: "",
                    tipoVia: null,
                    numero: null,
                    otros: null,
                    codPostal: null,
                    ciudad: "",
                    provinciaId: null,
                    provincia: null,
                    paisId: null,
                    pais: null,
                    apartado: null,
                    telefono: null,
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
                const { direccion, ...proveedorSinDireccion } = proveedor;
                nuevoProveedor.set(proveedorSinDireccion);
                setMostrarDireccion(false);
              }}
            >
              Quitar dirección
            </QBoton>
          )}

          {mostrarDireccion && (
            <quimera-formulario>
              <QSelect
              label="Tipo de vía"
                {...direccion.uiProps("tipoVia")}
                opciones={opcionesTipoVia}
              />
              <QInput
              label="Nombre de vía"
                {...direccion.uiProps("nombreVia")}
                textoValidacion={
                  mostrarErrorNombreVia
                    ? direccion.uiProps("nombreVia").textoValidacion
                    : ""
                }
                onChange={(valor) => {
                  direccion.uiProps("nombreVia").onChange(valor);
                  setMostrarErrorNombreVia(true);
                }}
              />
              <QInput
              label="Número"
              {...direccion.uiProps("numero")}
              />
              <QInput
              label="Otros"
              {...direccion.uiProps("otros")}
              />
              <QInput
              label="Código postal"
                {...direccion.uiProps("codPostal")}
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
              label="Provincia"
              {...direccion.uiProps("provincia")}
              />
              <QInput
              label="País"
              {...direccion.uiProps("pais")}
              />
              <QInput
              label="Apartado de correos"
                {...direccion.uiProps("apartado")}
              />
              <QInput
              label="Teléfono"
              {...direccion.uiProps("telefono")}
              />
            </quimera-formulario>
          )}

          <div className="botones maestro-botones">
            <QBoton onClick={crear} deshabilitado={!valido}>
              Crear
            </QBoton>
          </div>
        </div>
      </QModal>
    );
};