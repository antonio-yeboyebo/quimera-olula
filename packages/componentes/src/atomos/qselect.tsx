import { useTComponentes } from "../i18n/textos.ts";
import { useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import "./_forminput.css";
import { Etiqueta, FormFieldProps, Validacion, useEditando } from "./_forminput.tsx";
import { EnlaceFicha } from "./qenlace_ficha.tsx";
import { urlEnlace } from "./url_enlace.ts";

type Opcion = { valor: string; descripcion: string;[dato: string]: unknown };

export type QSelectProps = Omit<FormFieldProps, "onChange" | "onBlur"> & {
  opciones: Opcion[] | Opcion[][];
  soloLectura?: boolean;
  modificado?: boolean;
  enlace?: string;
  onChange?: (
    opcion: Opcion | null,
    evento: React.ChangeEvent<HTMLElement>
  ) => void;
  onBlur?: (
    opcion: Opcion | null,
    evento: React.FocusEvent<HTMLElement>
  ) => void;
  evaluarCambio?: () => void;
};

export const QSelect = ({
  label,
  nombre,
  deshabilitado,
  placeholder,
  opciones,
  valor = "",
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  soloLectura,
  modificado,
  enlace,
  ref,
  onChange,
  onBlur,
  evaluarCambio,
}: QSelectProps) => {
  const t = useTComponentes();
  const { editandoHandlers } = useEditando();
  const evaluarCambioRef = useRef(evaluarCambio);
  useLayoutEffect(() => {
    evaluarCambioRef.current = evaluarCambio;
  });

  if (soloLectura) {
    const descripcion = opciones
      .flat()
      .find((o) => o.valor === valor)?.descripcion;
    const enlaceHref = urlEnlace(enlace, valor);
    return (
      <quimera-select solo-lectura="" nombre={nombre} condensado={condensado}>
        <label>
          <Etiqueta label={label} />
          <span className="valor-solo-lectura">
            {descripcion || "—"}
            {enlaceHref && (
              <EnlaceFicha
                href={enlaceHref}
                className="enlace-solo-lectura"
                etiqueta={`${t("campos.abrir", { que: label ?? t("campos.ficha") })}${descripcion ? ` ${descripcion}` : ""}`}
              />
            )}
          </span>
        </label>
      </quimera-select>
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
  };

  const renderOpciones = (opciones: Opcion[] | Opcion[][]) =>
    opciones.map((opcion) =>
      Array.isArray(opcion) ? (
        <optgroup label={opcion[0].descripcion} key={opcion[0].descripcion}>
          {renderOpciones(opcion.slice(1))}
        </optgroup>
      ) : (
        <option key={opcion.valor} value={opcion.valor}>
          {opcion.descripcion}
        </option>
      )
    );

  const manejarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opcion = opciones
      .flat()
      .find((opcion) => opcion.valor === e.target.value);
    if (!opcion) {
      onChange?.(null, e);
      return;
    }
    flushSync(() => {
      onChange?.(opcion, e);
    });
    evaluarCambioRef.current?.();
  };

  const manejarBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    const opcion = opciones
      .flat()
      .find((opcion) => opcion.valor === e.target.value);
    if (!opcion) {
      onBlur?.(null, e);
      return;
    }
    onBlur?.(opcion, e);
    evaluarCambio?.();
  };

  return (
    <quimera-select {...attrs} {...editandoHandlers}>
      <label>
        <Etiqueta label={label} />
        <select
          name={nombre}
          defaultValue={onChange ? undefined : valor}
          value={onChange ? valor : undefined}
          required={!opcional}
          disabled={deshabilitado}
          onChange={manejarChange}
          onBlur={manejarBlur}
          ref={ref as React.RefObject<HTMLSelectElement>}
        >
          <option hidden value="">
            -{placeholder}-
          </option>
          {renderOpciones(opciones)}
        </select>
        <Validacion textoValidacion={textoValidacion} />
      </label>
    </quimera-select>
  );
};
