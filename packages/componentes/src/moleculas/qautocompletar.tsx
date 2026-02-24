import { useEffect, useRef, useState } from "react";
import { FormFieldProps } from "../atomos/_forminput.tsx";
import { QInput } from "../atomos/qinput.tsx";

type Opcion = { valor: string; descripcion: string };

export type QAutocompletarProps = Omit<FormFieldProps, "onChange" | "onBlur"> & {
  tiempoEspera?: number;
  longitudMinima?: number;
  descripcion?: string;
  obtenerOpciones: (valor: string) => Promise<Opcion[]>;
  onChange?: (
    opcion: Opcion | null,
    evento: React.ChangeEvent<HTMLElement>
  ) => void;
  onBlur?: (
    opcion: Opcion | null,
    evento: React.FocusEvent<HTMLElement>
  ) => void;
};

export const QAutocompletar = ({
  nombre,
  valor,
  tiempoEspera = 150,
  longitudMinima = 2,
  obtenerOpciones,
  onBlur,
  onChange,
  descripcion = "",
  ...props
}: QAutocompletarProps) => {
  const attrs = {
    nombre,
  };
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [valorDescrito, setValorDescrito] = useState<string>("");

  const valorReal = useRef<HTMLInputElement>(null);
  const temporizador = useRef<number | undefined>(undefined);

  const renderOpciones = opciones.map((opcion) => (
    <option key={opcion.valor} value={opcion.descripcion}>
      {opcion.descripcion}
    </option>
  ));

  const listaId = nombre + "-datalist-" + crypto.randomUUID();

  const regenerarOpciones = async (valor: string) => {
    clearTimeout(temporizador.current);

    if (valor.length < longitudMinima) return;

    temporizador.current = setTimeout(
      async () => setOpciones(await obtenerOpciones(valor)),
      tiempoEspera
    );
  };

  useEffect(() => {
    setValorDescrito(descripcion || "");
  }, [descripcion]);

  const manejarChange = (valor: string) => {
    if (valor === valorDescrito) return;

    setValorDescrito(valor);
  };

  const manejarInput = (valor: string, e: React.FormEvent<HTMLElement>) => {
    regenerarOpciones(valor);

    const opcion = opciones.find((opcion) => opcion.descripcion === valor);
    if (!opcion) {
      valorReal.current!.value = "";
      onChange?.(null, e as unknown as React.ChangeEvent<HTMLElement>);
      return;
    }

    const objetivo = e.target as HTMLInputElement;
    objetivo.value = opcion.descripcion;

    valorReal.current!.value = opcion.valor;
    onChange?.(opcion, e as unknown as React.ChangeEvent<HTMLElement>);
  };

  const manejarBlur = (valor: string, e: React.FocusEvent<HTMLElement>) => {
    const opcion = opciones.find((opcion) => opcion.descripcion === valor);

    if (opcion) {
      onBlur?.(opcion, e);
      return;
    }

    // const objetivo = e.target as HTMLInputElement;
    // objetivo.value = "";

    // valorReal.current!.value = "";
    // onBlur?.(null, e);
  };

  return (
    <quimera-autocompletar {...attrs}>
      <datalist id={listaId}>{renderOpciones}</datalist>
      <input
        ref={valorReal}
        type="hidden"
        name={nombre}
        value={valor || ""}
        defaultValue={undefined}
        required={!props.opcional}
      />
      <QInput
        {...props}
        nombre=""
        lista={listaId}
        autocompletar="off"
        onInput={manejarInput}
        onBlur={manejarBlur}
        onChange={manejarChange}
        valor={valorDescrito}
      />
    </quimera-autocompletar>
  );
};
