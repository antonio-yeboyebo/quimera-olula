import { useControlPantalla } from "@olula/lib/controles_pantalla.ts";
import React, { useEffect, useRef, useState } from "react";
import estilos from "./tabs.module.css";
import { useTComponentes } from "../../i18n/textos.ts";

interface TabProps {
  label: string;
  children: React.ReactNode;
  deshabilitado?: boolean;
}

type HijoTab = React.ReactElement<TabProps> | false | null | undefined;

interface TabsProps {
  children: HijoTab[];
  className?: string;
  tabInicial?: number;
  /** Al cambiar de pestaña (p. ej. para recordarla). */
  onCambio?: (indice: number) => void;
}

const Tab: React.FC<TabProps> = ({ children }) => {
  return <div>{children}</div>;
};

const Tabs: React.FC<TabsProps> = ({ children, className, tabInicial = 0, onCambio }) => {
  const t = useTComponentes();
  const [activeTab, setActivaInterna] = React.useState(tabInicial);
  const setActiveTab = (nueva: number) => {
    setActivaInterna(nueva);
    onCambio?.(nueva);
  };
  const [showArrows, setShowArrows] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  const indice = Math.min(activeTab, tabs.length - 1);

  // Cambiar de pestaña por voz / desde el asistente (ver controles_pantalla.ts).
  useControlPantalla("pestanas", () => ({
    describir: () => ({
      tipo: "pestanas",
      id: "",
      pestanas: tabs.map((tab) => tab.props.label),
      activa: indice,
    }),
    ejecutar: (accion, parametros) => {
      if (accion !== "seleccionar") return { ok: false, mensaje: t("ui.detalle.noSeHacerEsoConLas") };
      const etiqueta = typeof parametros.pestana === "string" ? parametros.pestana.toLowerCase() : null;
      const destino = etiqueta !== null
        ? tabs.findIndex((tab) => tab.props.label.toLowerCase() === etiqueta)
        : Number(parametros.indice);
      if (!Number.isInteger(destino) || destino < 0 || destino >= tabs.length || tabs[destino].props.deshabilitado) {
        return { ok: false, mensaje: t("ui.detalle.noEncuentroEsaPestana") };
      }
      setActiveTab(destino);
      return { ok: true, mensaje: t("ui.detalle.pestanaLabel", { label: tabs[destino].props.label }) };
    },
  }));

  // Detecta overflow
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      setShowArrows(slider.scrollWidth > slider.clientWidth);
    }
    const handleResize = () => {
      if (slider) {
        setShowArrows(slider.scrollWidth > slider.clientWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [children]);

  // Scroll al hacer clic en flechas
  const scrollSlider = (direction: "left" | "right") => {
    const slider = sliderRef.current;
    if (slider) {
      const scrollAmount = slider.clientWidth * 0.6;
      slider.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const { detalleTabs, active } = estilos;

  return (
    <div className={`${detalleTabs} ${className || ""}`.trim()}>
      <div className={estilos.tabSliderWrapper}>
        {showArrows && (
          <span
            className={estilos.arrow + " " + estilos.left}
            onClick={() => scrollSlider("left")}
          >
            &lt;
          </span>
        )}
        <div className={estilos.tabHeaderSlider} ref={sliderRef}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              disabled={tab.props.deshabilitado}
              className={indice === index ? active : "inactive"}
            >
              {tab.props.label}
            </button>
          ))}
        </div>
        {showArrows && (
          <span
            className={estilos.arrow + " " + estilos.right}
            onClick={() => scrollSlider("right")}
          >
            &gt;
          </span>
        )}
      </div>
      <div className="tab-content">{tabs[indice]}</div>
    </div>
  );
};

export { Tab, Tabs };
