import "./qdate.css";

export type FormInputProps = {
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
  onChange?: (valor: string, evento: React.ChangeEvent<HTMLElement>) => void;
  onBlur?: (valor: string, evento: React.FocusEvent<HTMLElement>) => void;
};

type QInputProps = FormInputProps & {
  lista?: string;
  autocompletar?: "off" | "on";
  onInput?: (valor: string, evento: React.FormEvent<HTMLInputElement>) => void;
};

export const QDate = ({
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
  onBlur,
  onInput,
}: QInputProps) => {
  const attrs = { erroneo, advertido, valido, opcional, condensado };

  return (
    <quimera-date {...attrs}>
      <label>
        <span className="etiqueta">
          {label}&nbsp;
          <span className="etiqueta-opcional">(opcional)</span>
        </span>
        <input
          type="date"
          name={nombre}
          placeholder={placeholder}
          value={onChange ? valor : undefined}
          defaultValue={onChange ? undefined : valor}
          disabled={deshabilitado}
          required={!opcional}
          onChange={(e) => onChange?.(e.target.value, e)}
          onBlur={(e) => onBlur?.(e.target.value, e)}
          onInput={(e) => onInput?.((e.target as HTMLInputElement).value, e)}
        />
        { textoValidacion && <span className="texto-validacion">{textoValidacion}</span> }
      </label>
    </quimera-date>
  );
};




