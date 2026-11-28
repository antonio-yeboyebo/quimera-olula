import { useTComponentes } from "../i18n/textos.ts";
import { useEffect, useRef, useState } from "react";
import { Etiqueta, FormFieldProps } from "../atomos/_forminput.tsx";
import { EnlaceFicha } from "../atomos/qenlace_ficha.tsx";
import { urlEnlace } from "../atomos/url_enlace.ts";
import { QInput } from "../atomos/qinput.tsx";
import { getIdUnico } from "../helpers.ts";
import "./../atomos/_forminput.css";
import "./qautocompletar.css";

type OpcionBase = {
  valor: string;
  descripcion: string;
  descripcionOpcion?: string;
  [dato: string]: unknown;
};

export type QAutocompletarProps<T extends OpcionBase = OpcionBase> = Omit<
  FormFieldProps,
  "onChange" | "onBlur"
> & {
  tiempoEspera?: number;
  longitudMinima?: number;
  descripcion?: string;
  obtenerOpciones: (texto: string, id?: string) => Promise<T[]>;
  soloLectura?: boolean;
  enlace?: string;
  permitirValorLibre?: boolean;
  onChange?: (
    opcion: T | null,
    evento: React.ChangeEvent<HTMLElement>
  ) => void;
  onBlur?: (
    opcion: T | null,
    evento: React.FocusEvent<HTMLElement>
  ) => void;
  /** Se reenvía tal cual a QInput/_forminput — es lo que dispara el
   * guardado en blur cuando se usa "{...uiProps(...)}" (ver PaisSelector). */
  evaluarCambio?: () => void;
};


export const QAutocompletar = <T extends OpcionBase = OpcionBase>({
  nombre,
  valor,
  tiempoEspera = 150,
  longitudMinima = 2,
  obtenerOpciones,
  onBlur,
  onChange,
  descripcion = "",
  soloLectura = false,
  enlace,
  opcional,
  deshabilitado,
  permitirValorLibre = false,
  ...props
}: QAutocompletarProps<T>) => {
  const t = useTComponentes();
  const attrs = {
    nombre,
  };
  const [opciones, setOpciones] = useState<T[]>([]);
  const [valorDescrito, setValorDescrito] = useState<string>("");

  const valorReal = useRef<HTMLInputElement>(null);
  const editando = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const renderOpciones = opciones.map((opcion) => {
    const descripcion = opcion?.descripcionOpcion || opcion.descripcion;
    return (
      <option key={opcion.valor} value={descripcion}>
        {descripcion}
      </option>
    );
  });

  const listaId = useRef(nombre + "-datalist-" + getIdUnico());

  const regenerarOpciones = async (valor: string) => {
    clearTimeout(temporizador.current);

    if (valor.length < longitudMinima) return;

    temporizador.current = setTimeout(
      async () => setOpciones(await obtenerOpciones(valor)),
      tiempoEspera
    );
  };

  useEffect(() => {
    if (!editando.current) {
      setValorDescrito(descripcion || "");
    }
  }, [descripcion]);

  useEffect(() => {
    if (!editando.current && !valor) {
      setValorDescrito("");
    }
  }, [valor]);

  useEffect(() => {
    if (editando.current || !valor || descripcion) return;

    obtenerOpciones("", valor).then((opciones) => {
      const opcion = opciones.find((o) => o.valor === valor);
      if (opcion) {
        setValorDescrito(opcion.descripcion);
      }
    });
  }, [valor, descripcion]);

  useEffect(() => {
    if (!editando.current || opciones.length === 0) return;

    const opcion = opciones.find(
      (o) => (o?.descripcionOpcion || o.descripcion) === valorDescrito
    );
    if (opcion && valorReal.current!.value !== opcion.valor) {
      valorReal.current!.value = opcion.valor;
      onChangeRef.current?.(opcion, {} as React.ChangeEvent<HTMLElement>);
    }
  }, [opciones, valorDescrito]);

  const manejarChange = (valor: string) => {
    if (valor === valorDescrito) return;
    editando.current = true;
    setValorDescrito(valor);
  };

  const manejarInput = (valor: string, e: React.FormEvent<HTMLElement>) => {
    editando.current = true;

    const opcion = opciones.find(
      (opcion) => (opcion?.descripcionOpcion || opcion.descripcion) === valor
    );

    if (opcion) {
      clearTimeout(temporizador.current);
      const descripcion = opcion?.descripcionOpcion || opcion.descripcion;
      const objetivo = e.target as HTMLInputElement;
      objetivo.value = descripcion;

      valorReal.current!.value = opcion.valor;
      onChange?.(opcion, e as unknown as React.ChangeEvent<HTMLElement>);
    } else {
      regenerarOpciones(valor);
      if (valorReal.current!.value !== "") {
        valorReal.current!.value = "";
        onChange?.(null, e as unknown as React.ChangeEvent<HTMLElement>);
      }
    }
  };

  const manejarLimpiar = () => {
    editando.current = false;
    setValorDescrito("");
    setOpciones([]);
    valorReal.current!.value = "";
    onChange?.(null, {} as React.ChangeEvent<HTMLElement>);
  };

  const manejarBlur = (valor: string, e: React.FocusEvent<HTMLElement>) => {
    const estabaEditando = editando.current;
    editando.current = false;

    if (!estabaEditando) {
      onBlur?.(null, e);
      return;
    }

    const opcion = opciones.find(
      (opcion) => (opcion?.descripcionOpcion || opcion.descripcion) === valor
    );

    if (opcion) {
      valorReal.current!.value = opcion.valor;
      onChange?.(opcion, e as unknown as React.ChangeEvent<HTMLElement>);
      onBlur?.(opcion, e);
    } else if (permitirValorLibre && valor !== "") {
      valorReal.current!.value = valor;
      const opcionLibre = { valor, descripcion: valor } as T;
      onChange?.(opcionLibre, e as unknown as React.ChangeEvent<HTMLElement>);
      onBlur?.(opcionLibre, e);
    } else {
      if (valorReal.current!.value !== "") {
        valorReal.current!.value = "";
        onChange?.(null, e as unknown as React.ChangeEvent<HTMLElement>);
      }
      if (valor !== "") {
        setValorDescrito("");
      }
      onBlur?.(null, e);
    }
  };

  const enlaceHref = urlEnlace(enlace, valor);

  if (soloLectura) {
    return (
      <quimera-autocompletar {...attrs} solo-lectura="">
        <label>
          <Etiqueta label={props.label} />
          <span className="valor-solo-lectura">
            {valorDescrito || "—"}
            {enlaceHref && (
              <EnlaceFicha
                href={enlaceHref}
                className="enlace-solo-lectura"
                etiqueta={t("campos.abrir", { que: props.label ?? t("campos.ficha") })}
              />
            )}
          </span>
        </label>
      </quimera-autocompletar>
    );
  }

  return (
    <quimera-autocompletar {...attrs}>
      <datalist id={listaId.current}>{renderOpciones}</datalist>
      <input
        ref={valorReal}
        type="hidden"
        name={nombre}
        value={valor || ""}
        defaultValue={undefined}
        required={!opcional}
      />
      <div className="autocompletar-wrapper">
        <QInput
          {...props}
          opcional={opcional}
          deshabilitado={deshabilitado}
          nombre=""
          tipo="autocompletar"
          lista={listaId.current}
          autocompletar="off"
          onInput={manejarInput}
          onBlur={manejarBlur}
          onChange={manejarChange}
          placeholder={props.placeholder}
          valor={valorDescrito}
        />
        {opcional && valor && !deshabilitado && (
          <button
            type="button"
            className="autocompletar-limpiar"
            onClick={manejarLimpiar}
            aria-label={t("campos.limpiarSeleccion")}
            tabIndex={-1}
          >
            ×
          </button>
        )}
        {enlaceHref && (
          <EnlaceFicha
            href={enlaceHref}
            className="autocompletar-enlace"
            etiqueta={t("campos.abrir", { que: props.label ?? t("campos.ficha") })}
            tabIndex={-1}
          />
        )}
      </div>
    </quimera-autocompletar>
  );
};
