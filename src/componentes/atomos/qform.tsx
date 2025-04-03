import { PropsWithChildren } from "react";
import "./qform.css";

type QFormProps = {
  onSubmit: (
    valores: Record<string, string>,
    evento: React.FormEvent<HTMLFormElement>
  ) => void;
  onReset?: () => void;
};

export const QForm = ({
  onSubmit,
  onReset,
  children,
}: PropsWithChildren<QFormProps>) => {
  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    if (!onSubmit) return;

    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData) as Record<string, string>;

    onSubmit(data, event);
  };

  return (
    <quimera-formulario>
      <form onSubmit={submitHandler} onReset={onReset}>
        {children}
      </form>
    </quimera-formulario>
  );
};
