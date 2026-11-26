import { opcionesTipoIdFiscalCompras } from "#/compras/comun/valores.ts";
import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
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
import { useTCompras } from "#/compras/i18n/index.ts";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

export const CrearProveedor = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTCompras();
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

    // El valor se guarda en BD en español; solo se traduce lo que se ve.
    const opcionesTipoVia = (["Calle", "Avenida", "Plaza", "Paseo", "Camino", "Carretera"] as const).map(
      (valor) => ({ valor, descripcion: t(`comun.direccion.tiposVia.${valor}`) })
    );

    return (
      <QModal
        abierto={true}
        nombre="crearProveedor"
        titulo={t("proveedor.crear.titulo")}
        onCerrar={cancelar}
      >
        <div className="CrearProveedor">
          <quimera-formulario>
            <QInput label={t("comun.campos.nombre")} {...uiProps("nombre")} ref={focus} />
            <TipoIdFiscal
              {...uiProps("tipoIdFiscal")}
              opciones={opcionesTipoIdFiscalCompras(t)}
            />
            <QInput label={t("comun.campos.idFiscal")} {...uiProps("idFiscal")} />
          </quimera-formulario>
          {!proveedor.empresaId && (
            <QAviso>
              {t("proveedor.crear.sinEmpresa")}
            </QAviso>
          )}

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
              {t("proveedor.crear.anadirDireccion")}
            </QBoton>
          ) : (
            <QBoton
              variante="texto"
              onClick={() => {
                const { direccion: _direccion, ...proveedorSinDireccion } = proveedor;
                nuevoProveedor.set(proveedorSinDireccion);
                setMostrarDireccion(false);
              }}
            >
              {t("proveedor.crear.quitarDireccion")}
            </QBoton>
          )}

          {mostrarDireccion && (
            <quimera-formulario>
              <QSelect
              label={t("proveedor.crear.tipoVia")}
                {...direccion.uiProps("tipoVia")}
                opciones={opcionesTipoVia}
              />
              <QInput
              label={t("proveedor.crear.nombreVia")}
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
              label={t("comun.direccion.numero")}
              {...direccion.uiProps("numero")}
              />
              <QInput
              label={t("comun.direccion.otros")}
              {...direccion.uiProps("otros")}
              />
              <QInput
              label={t("comun.direccion.codigoPostal")}
                {...direccion.uiProps("codPostal")}
              />
              <QInput
              label={t("comun.direccion.ciudad")}
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
              label={t("comun.direccion.provincia")}
              {...direccion.uiProps("provincia")}
              />
              <QInput
              label={t("comun.direccion.pais")}
              {...direccion.uiProps("pais")}
              />
              <QInput
              label={t("comun.direccion.apartado")}
                {...direccion.uiProps("apartado")}
              />
              <QInput
              label={t("comun.direccion.telefono")}
              {...direccion.uiProps("telefono")}
              />
            </quimera-formulario>
          )}

          <div className="botones maestro-botones">
            <QBoton onClick={crear} deshabilitado={!valido}>
              {t("comun.botones.crear")}
            </QBoton>
          </div>
        </div>
      </QModal>
    );
};