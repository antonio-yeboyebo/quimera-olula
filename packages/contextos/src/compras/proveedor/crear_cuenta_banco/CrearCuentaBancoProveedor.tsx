import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Proveedor } from "../diseño.ts";
import {
  metaNuevaCuentaBancoProveedor,
  nuevaCuentaBancoProveedorVacia,
} from "../dominio.ts";
import { postCuentaBancoProveedor } from "../infraestructura.ts";
import "./CrearCuentaBancoProveedor.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CrearCuentaBancoProveedor = ({
  proveedor,
  publicar,
}: {
  proveedor: Proveedor;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const inicial = useMemo(nuevaCuentaBancoProveedorVacia, []);

  const { modelo, uiProps, valido } = useModelo(
    metaNuevaCuentaBancoProveedor,
    inicial
  );

  const crear_ = useCallback(async () => {
    const id = await postCuentaBancoProveedor(proveedor.id, modelo);
    publicar("cuenta_creada", id);
  }, [modelo, proveedor.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("alta_de_cuenta_cancelada"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);
  const focus = useFocus();

  return (
    <QModal
      abierto={true}
      nombre="crearCuentaBancoProveedor"
      titulo={t("proveedor.cuentas.crear")}
      onCerrar={cancelar}
    >
      <div className="CrearCuentaBancoProveedor">
        <quimera-formulario>
          <QInput label={t("comun.campos.descripcion")} {...uiProps("descripcion")} ref={focus} />
          <QInput label={t("proveedor.cuentas.iban")} {...uiProps("iban")} />
        </quimera-formulario>
      </div>
      <div className="botones maestro-botones">
        <QBoton onClick={crear} deshabilitado={!valido}>
          {t("comun.botones.crear")}
        </QBoton>
      </div>
    </QModal>
  );
};
