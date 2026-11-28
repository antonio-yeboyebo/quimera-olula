import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, formatearMoneda, MetaModelo } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NominaRemesable } from "../../diseño.js";
import { getNominasRemesables } from "../../infraestructura.js";
import { NuevaRemesaNominas } from "../diseño.js";
import "./CrearRemesaNominas.css";
import { useTTesoreria } from "../../../i18n/index.ts";

type FechaPagoForm = { fechaPago: Date };

const metaFechaPago: MetaModelo<FechaPagoForm> = {
  campos: {
    fechaPago: { tipo: "fecha", requerido: true },
  },
};

/**
 * Crea una remesa de pago de nóminas: las emitidas que aún no están en
 * ninguna remesa, la cuenta de cargo y la fecha prevista de pago.
 */
export const CrearRemesaNominas = ({ publicar }: { publicar: EmitirEvento }) => {
  const t = useTTesoreria();
  const [nominas, setNominas] = useState<NominaRemesable[] | null>(null);
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [cuentaId, setCuentaId] = useState("");
  const inicial = useMemo((): FechaPagoForm => ({ fechaPago: new Date() }), []);
  const { modelo, uiProps, valido } = useModelo(metaFechaPago, inicial);
  const fechaPago = modelo.fechaPago;

  useEffect(() => {
    getNominasRemesables().then(setNominas);
  }, []);

  const crear_ = useCallback(
    async () =>
      publicar("crear_remesa_nominas_confirmado", {
        cuentaId,
        fechaPago,
        nominaIds: elegidas,
      } satisfies NuevaRemesaNominas),
    [cuentaId, fechaPago, elegidas, publicar]
  );

  const cancelar_ = useCallback(
    () => publicar("crear_remesa_nominas_cancelado"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);

  const alternar = (id: string, marcada: boolean) =>
    setElegidas((actuales) =>
      marcada ? [...actuales, id] : actuales.filter((otra) => otra !== id)
    );

  const todas = nominas ?? [];
  const total = todas
    .filter((nomina) => elegidas.includes(nomina.id))
    .reduce((suma, nomina) => suma + nomina.importe, 0);

  return (
    <QModal
      abierto={true}
      nombre="crear_remesa_nominas"
      titulo={t("remesa_pago.nuevaRemesaDeNominas")}
      onCerrar={cancelar}
    >
      <div className="CrearRemesaNominas">
        <quimera-formulario>
          <CuentaBancariaSelect
            nombre="cuenta_id"
            label={t("remesa_pago.cuentaDeCargo")}
            valor={cuentaId}
            onChange={(opcion) => setCuentaId(opcion?.valor ?? "")}
          />
          <QDate label={t("remesa_pago.fechaDePagoPrevista")} {...uiProps("fechaPago")} />
        </quimera-formulario>

        {nominas === null ? (
          <p>{t("remesa_pago.cargandoNominas")}</p>
        ) : todas.length === 0 ? (
          <p>{t("remesa_pago.noHayNominasEmitidasPendientesDe")}</p>
        ) : (
          <ul className="nominas-remesables">
            {todas.map((nomina) => (
              <li key={nomina.id}>
                <QCheckbox
                  nombre={`nomina_${nomina.id}`}
                  label={`${nomina.nombreEmpleado || nomina.empleadoId} · ${
                    nomina.fechaNomina ? formatearFechaDate(nomina.fechaNomina) : ""
                  }`}
                  valor={elegidas.includes(nomina.id)}
                  onChange={(valor) => alternar(nomina.id, valor === "true")}
                />
                <span className="importe-nomina">
                  {formatearMoneda(nomina.importe, "EUR")}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="botones maestro-botones">
          <span className="total-remesa">
            {t("remesa_pago.lengthNominasTotal", { length: elegidas.length, total: formatearMoneda(total, "EUR") })}
          </span>
          <QBoton
            onClick={crear}
            deshabilitado={!cuentaId || !valido || elegidas.length === 0}
          >
            {t("remesa_pago.crearRemesa")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
