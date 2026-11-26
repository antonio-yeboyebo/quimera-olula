import { useTComponentes } from "../i18n/textos.ts";
import "./_forminput.css";
import {
  Etiqueta,
  FormInput,
  FormInputProps,
  Validacion,
  useEditando,
} from "./_forminput.tsx";
import { formatearMoneda, formatearNumero } from "@olula/lib/dominio.ts";
import { EnlaceFicha } from "./qenlace_ficha.tsx";
import { urlEnlace } from "./url_enlace.ts";

export type QInputProps = FormInputProps & {
  modificado?: boolean;
  soloLectura?: boolean;
  /** En solo lectura: plantilla de la URL de la ficha del valor (`{id}` = el valor). */
  enlace?: string;
};

const formatearValorNumerico = (
  valor: string,
  tipo?: string,
  divisa?: string,
  decimales?: number
): string => {
  if (!valor) return "—";
  if (tipo === "moneda") return formatearMoneda(valor, divisa ?? "EUR");
  if (tipo === "entero") return formatearNumero(valor, 0);
  if (tipo === "decimal" || tipo === "numero") return formatearNumero(valor, decimales);
  return valor;
};

export const QInput = ({
  label,
  nombre,
  deshabilitado,
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  tipo,
  modificado,
  soloLectura,
  enlace,
  valor,
  divisa,
  decimales,
  ...props
}: QInputProps) => {
  const t = useTComponentes();
  const { editandoHandlers } = useEditando();

  if (soloLectura) {
    const esNumerico = tipo === "numero" || tipo === "entero" || tipo === "decimal" || tipo === "moneda";
    const valorMostrado = esNumerico
      ? formatearValorNumerico(valor || "", tipo, divisa, decimales)
      : (valor || "—");

    return (
      <quimera-input
        solo-lectura=""
        nombre={nombre}
        tipo={tipo}
        condensado={condensado}
        erroneo={erroneo}
        advertido={advertido}
        valido={valido}
      >
        <label>
          <Etiqueta label={label} />
          {tipo === "checkbox" ? (
            <input type="checkbox" checked={valor === "true"} disabled readOnly />
          ) : (
            <span className="valor-solo-lectura">
              {valorMostrado}
              {urlEnlace(enlace, valor) && (
                <EnlaceFicha
                  href={urlEnlace(enlace, valor)!}
                  className="enlace-solo-lectura"
                  etiqueta={`${t("campos.abrir", { que: label ?? t("campos.ficha") })} ${valor}`}
                />
              )}
            </span>
          )}
        </label>
      </quimera-input>
    );
  }

  const attrs = {
    nombre,
    erroneo,
    advertido,
    valido,
    opcional,
    condensado,
    deshabilitado,
    modificado,
    tipo,
  };

  const inputAttrs = {
    nombre,
    deshabilitado,
    opcional,
    tipo,
    valor,
    divisa,
    decimales,
    ...props,
  };

  return (
    <quimera-input {...attrs} {...editandoHandlers}>
      <label>
        <Etiqueta label={label} />
        <FormInput {...inputAttrs} />
        <Validacion textoValidacion={textoValidacion} />
      </label>
    </quimera-input>
  );
};
