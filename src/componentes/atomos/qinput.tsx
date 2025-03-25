import "./qinput.css";

type QInputProps = {
  label: string;
  nombre: string;
  deshabilitado?: boolean;
  placeholder?: string;
  valor?: string;
  textoValidacion?: string;
  erroneo?: boolean;
  advertido?: boolean;
  valido?: boolean;
  opcional?: boolean;
  condensado?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const QInput = ({
  label,
  nombre,
  deshabilitado,
  placeholder,
  valor = "",
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  onChange,
}: QInputProps) => {
  const attrs = { erroneo, advertido, valido, opcional, condensado };

  return (
    <quimera-input {...attrs}>
      <label>
        <span className="etiqueta">
          {label}&nbsp;
          <span className="etiqueta-opcional">(opcional)</span>
        </span>
        <input
          type="text"
          name={nombre}
          placeholder={placeholder}
          value={onChange ? valor : undefined}
          defaultValue={onChange ? undefined : valor}
          disabled={deshabilitado}
          onChange={onChange}
        />
        <span className="texto-validacion">{textoValidacion}</span>
      </label>
    </quimera-input>
  );
};
