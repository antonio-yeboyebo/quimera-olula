import { useTComponentes } from "../i18n/textos.ts";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { formatearMoneda, formatearNumero } from "@olula/lib/dominio.ts";
import { useEsMovil } from "../maestro/useEsMovil.ts";

export type FormFieldProps = {
  id?: string;
  label: string;
  nombre: string;
  deshabilitado?: boolean;
  placeholder?: string;
  valor?: string;
  maxLength?: number;
  textoValidacion?: string;
  erroneo?: boolean;
  advertido?: boolean;
  valido?: boolean;
  opcional?: boolean;
  condensado?: boolean;
  autoSeleccion?: boolean;
  autoFocus?: boolean;
  divisa?: string;
  decimales?: number;
  ref?: React.RefObject<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null
  >;
  onChange?: (
    valor: string,
    evento: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onKeyDown?: (evento: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (valor: string, evento: React.FocusEvent<HTMLElement>) => void;
  onEnterKeyUp?: (
    valor: string,
    evento: React.KeyboardEvent<HTMLElement>
  ) => void;
};

const tiposFormInput = {
  texto: "text",
  numero: "number",
  entero: "number",
  decimal: "number",
  fecha: "date",
  hora: "time",
  fecha_hora: "datetime-local",
  contraseña: "password",
  email: "email",
  checkbox: "checkbox",
  radio: "radio",
  telefono: "tel",
  color: "color",
  fichero: "file",
  url: "url",
  rango: "range",
  moneda: "number",
  autocompletar: "text",
  selector: "text",
  intervalo_fechas: "date",
  intervalo_numeros: "number",
  multiseleccion: "checkbox",
} as const;

const TIPOS_NUMERICOS = new Set<string>([
  "numero", "entero", "decimal", "moneda", "rango", "intervalo_numeros",
]);

const TIPOS_FORMATEABLES = new Set<string>([
  "numero", "entero", "decimal", "moneda",
]);

export type FormInputProps = FormFieldProps & {
  lista?: string;
  autocompletar?: "off" | "on";
  onInput?: (valor: string, evento: React.FormEvent<HTMLInputElement>) => void;
  tipo?: keyof typeof tiposFormInput;
  evaluarCambio?: () => void;
};

type InputProps = Omit<FormInputProps, "label"> & {
  checked?: boolean;
  autoFocus?: boolean;
};

export const FormInput = ({
  id,
  nombre,
  deshabilitado,
  placeholder,
  tipo = "texto",
  valor = "",
  checked,
  opcional,
  lista,
  autocompletar,
  autoSeleccion,
  autoFocus,
  maxLength,
  divisa,
  decimales,
  ref,
  onChange,
  onBlur,
  onInput,
  onEnterKeyUp,
  evaluarCambio,
}: InputProps) => {
  const t = useTComponentes();
  const evaluarCambioRef = useRef(evaluarCambio);
  useLayoutEffect(() => {
    evaluarCambioRef.current = evaluarCambio;
  });
  const esMovil = useEsMovil();
  const [enfocado, setEnfocado] = useState(false);

  const obtenerValorPorDefecto = () => {
    if (valor !== undefined && valor !== "" && valor != null) return valor;

    switch (tipo) {
      case "numero":
      case "moneda":
      case "rango":
        return "";
      default:
        return "";
    }
  };

  const valorFinal = onChange ? obtenerValorPorDefecto() : undefined;

  const esFormateable = TIPOS_FORMATEABLES.has(tipo);

  const valorFormateado = useMemo(() => {
    if (!esFormateable) return null;
    const v = valorFinal ?? valor;
    if (v === "" || v === undefined || v === null) return null;
    if (tipo === "moneda") return formatearMoneda(v, divisa ?? "EUR");
    if (tipo === "entero") return formatearNumero(v, 0);
    return formatearNumero(v, decimales);
  }, [esFormateable, valorFinal, valor, tipo, divisa, decimales]);

  const mostrarFormateado = !enfocado && valorFormateado !== null;

  const manejarFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (esFormateable) setEnfocado(true);
    if (autoSeleccion || (esMovil && TIPOS_NUMERICOS.has(tipo))) {
      e.target.select();
    }
  };

  const manejarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    onChange?.(target.type === 'checkbox' ? target.checked.toString() : target.value, e);
  };

  // flushSync + ref (no el "evaluarCambio" cerrado en este render): cuando
  // onBlur dispara a su vez un onChange (p.ej. QAutocompletar al elegir una
  // opción y perder el foco en el mismo tick), el cambio de modelo aún no
  // se habría reflejado en el "evaluarCambio" de este cierre y el guardado
  // se evaluaría contra el valor viejo, sin ver la modificación. Mismo
  // patrón ya usado en manejarLimpiar.
  const manejarBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (esFormateable) setEnfocado(false);
    flushSync(() => {
      onBlur?.(e.target.value, e);
    });
    evaluarCambioRef.current?.();
  };

  const manejarInput = (e: React.FormEvent<HTMLInputElement>) => {
    onInput?.((e.target as HTMLInputElement).value, e);
  };

  const manejarKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const evento = e.target as unknown as {
        value: string;
      };
      onEnterKeyUp?.(evento.value, e);
    }
  };

  const manejarLimpiar = () => {
    if (onChange) {
      flushSync(() => {
        onChange("", { target: { value: "", type: "time" } } as React.ChangeEvent<HTMLInputElement>);
      });
    }
    evaluarCambioRef.current?.();
  };

  const inputProps = {
    id: id,
    type: tiposFormInput[tipo] ?? "text",
    name: nombre,
    placeholder: placeholder,
    disabled: deshabilitado,
    required: !opcional,
    maxLength: maxLength,
    list: lista,
    autoComplete: autocompletar ?? (tipo === "autocompletar" ? "on" : "off"),
    onChange: manejarChange,
    onBlur: manejarBlur,
    onFocus: manejarFocus,
    onInput: manejarInput,
    onKeyUp: manejarKeyUp,
    autoFocus: autoFocus,
    ref: ref as React.RefObject<HTMLInputElement>,
  }
  if (tipo === "checkbox") {
    const checkedValue = checked ?? valor === "true";
    return (
      <input
        {...inputProps}
        checked={onChange ? checkedValue : undefined}
        defaultChecked={onChange ? undefined : checkedValue}
      />
    );
  }

  if (tipo === "hora") {
    return (
      <div className="hora-wrapper">
        <input
          {...inputProps}
          value={valorFinal as string}
          defaultValue={onChange ? undefined : valor as string}
        />
        {opcional && valor && !deshabilitado && (
          <button
            type="button"
            className="hora-limpiar"
            onClick={manejarLimpiar}
            aria-label={t("campos.limpiarHora")}
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
    );
  }

  if (esFormateable) {
    return (
      <div className="numero-wrapper">
        <input
          {...inputProps}
          className={mostrarFormateado ? "numero-oculto" : undefined}
          value={valorFinal as string}
          defaultValue={onChange ? undefined : valor as string}
        />
        {mostrarFormateado && (
          <span className="numero-formateado">{valorFormateado}</span>
        )}
      </div>
    );
  }

  return (
    <input
      {...inputProps}
      value={valorFinal as string}
      defaultValue={onChange ? undefined : valor as string}
    />
  );
};


export const Etiqueta = ({ label }: { label: string }) => {
  const t = useTComponentes();
  return (
    <span className="etiqueta">
      {label}
      <span className="etiqueta-opcional">{t("campos.opcional")}</span>
    </span>
  );
};

export const Validacion = ({
  textoValidacion,
}: {
  textoValidacion: string;
}) => {
  if (!textoValidacion) return null;

  return <span className="texto-validacion">{textoValidacion}</span>;
};

export const useEditando = () => {
  const editando = useRef(false);

  return {
    editandoHandlers: {
      onFocusCapture: (e: React.FocusEvent) => {
        editando.current = false;
        e.currentTarget.removeAttribute("data-editando");
      },
      onInputCapture: (e: React.FormEvent) => {
        if (!editando.current) {
          editando.current = true;
          e.currentTarget.setAttribute("data-editando", "");
        }
      },
      onBlurCapture: (e: React.FocusEvent) => {
        editando.current = false;
        e.currentTarget.removeAttribute("data-editando");
      },
    },
  };
};
