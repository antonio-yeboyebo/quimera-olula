import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useState } from "react";
import { Remesa } from "../../diseño.js";
import {
  AvisoDomiciliacion,
  FormatoFicheroRemesa,
  getDomiciliacionesRemesa,
  getFicheroRemesa,
} from "../../infraestructura.js";
import "./GenerarFicheroRemesa.css";
import { tTesoreria, useTTesoreria } from "../../../i18n/index.ts";

const FORMATOS = [
  { valor: "csb19", get descripcion() { return tTesoreria("remesa.csb19Cuaderno19ComoElErp"); } },
  { valor: "sepa", get descripcion() { return tTesoreria("remesa.sepaAdeudosDirectosPain008"); } },
];

const descargar = (blob: Blob, nombre: string) => {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
};

/**
 * TES-07: genera y descarga el fichero bancario de la remesa. Antes comprueba
 * las domiciliaciones (`comprobarCuentasDom` del ERP) y, si hay avisos, pide
 * confirmación para seguir.
 */
export const GenerarFicheroRemesa = ({
  remesa,
  publicar,
}: {
  remesa: Remesa;
  publicar: EmitirEvento;
}) => {
  const t = useTTesoreria();
  const [formato, setFormato] = useState<FormatoFicheroRemesa>("csb19");
  const [agruparPorCliente, setAgruparPorCliente] = useState(false);
  const [incluirLineas, setIncluirLineas] = useState(false);
  const [avisos, setAvisos] = useState<AvisoDomiciliacion[] | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const cerrar = () => publicar("fichero_cerrado");

  const generar = async () => {
    setTrabajando(true);
    try {
      const blob = await getFicheroRemesa(remesa.id, {
        formato,
        agruparPorCliente,
        incluirLineas: incluirLineas && !agruparPorCliente,
      });
      descargar(blob, formato === "sepa" ? `remesa-${remesa.id}.xml` : `remesa-${remesa.id}.txt`);
      cerrar();
    } finally {
      setTrabajando(false);
    }
  };

  const comprobarYGenerar = async () => {
    setTrabajando(true);
    try {
      const encontrados = await getDomiciliacionesRemesa(remesa.id, formato);
      if (encontrados.length > 0) {
        setAvisos(encontrados);
        return;
      }
    } finally {
      setTrabajando(false);
    }
    await generar();
  };

  return (
    <QModal abierto={true} nombre="generar_fichero_remesa" titulo={t("remesa.ficheroBancarioDeLaRemesa")} onCerrar={cerrar}>
      <div className="GenerarFicheroRemesa">
        {avisos === null ? (
          <>
            <quimera-formulario>
              <QSelect
                label={t("remesa.formato")}
                nombre="formato"
                valor={formato}
                opciones={FORMATOS}
                onChange={(opcion) => setFormato((opcion?.valor as FormatoFicheroRemesa) ?? "csb19")}
              />
              {formato === "csb19" && (
                <>
                  <QCheckbox
                    label={t("remesa.agruparRecibosPorCliente")}
                    nombre="agrupar_por_cliente"
                    valor={agruparPorCliente}
                    onChange={(_, evento) => setAgruparPorCliente(evento.target.checked)}
                  />
                  <QCheckbox
                    label={t("remesa.incluirLasLineasDeLaFactura")}
                    nombre="incluir_lineas"
                    valor={incluirLineas && !agruparPorCliente}
                    deshabilitado={agruparPorCliente}
                    onChange={(_, evento) => setIncluirLineas(evento.target.checked)}
                  />
                </>
              )}
            </quimera-formulario>
            <div className="botones maestro-botones">
              <QBoton onClick={comprobarYGenerar} deshabilitado={trabajando}>
                {t("remesa.generar")}
              </QBoton>
            </div>
          </>
        ) : (
          <>
            <p>{t("remesa.losSiguientesRecibosNoTienenUna")}</p>
            <ul className="avisos-domiciliacion">
              {avisos.map((aviso, indice) => (
                <li key={`${aviso.reciboId}-${indice}`}>
                  {t("remesa.clienteNombreclienteClienteidReciboCodig", { nombreCliente: aviso.nombreCliente, clienteId: aviso.clienteId, codigo: aviso.codigo, aviso: aviso.aviso })}
                </li>
              ))}
            </ul>
            <p>{t("remesa.deseaContinuar")}</p>
            <div className="botones maestro-botones">
              <QBoton tipo="reset" variante="texto" onClick={() => setAvisos(null)}>
                {t("remesa.volver")}
              </QBoton>
              <QBoton onClick={generar} deshabilitado={trabajando}>
                {t("remesa.generarDeTodosModos")}
              </QBoton>
            </div>
          </>
        )}
      </div>
    </QModal>
  );
};
