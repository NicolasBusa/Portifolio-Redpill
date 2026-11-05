"use client";

import { MatrixHologram } from "@/components/matrix-hologram";
import { defaultHologramSettings, hologramQualities, signalControls, type HologramSettings, type Quality, type SignalKey } from "@/lib/hologram-settings";

const qualityLabels: Record<Quality, string> = {
  auto: "Automática", high: "Alta", medium: "Média", low: "Baixa",
};

export default function HologramTuning({ settings, onChange }: {
  settings: HologramSettings;
  onChange: (settings: HologramSettings) => void;
}) {
  return (
    <div className="admin-grid admin-hologram">
      <div>
        <label className="admin-field">
          <span>Qualidade de renderização</span>
          <select value={settings.quality} onChange={(event) => onChange({ ...settings, quality: event.target.value as Quality })}>
            {hologramQualities.map((quality) => <option key={quality} value={quality}>{qualityLabels[quality]}</option>)}
          </select>
        </label>
        <fieldset className="admin-signal">
          <legend>Ajustar sinal · Tune signal</legend>
          {(Object.keys(signalControls) as SignalKey[]).map((key) => {
            const { label, min, max, step } = signalControls[key];
            return <label className="admin-field" key={key}>
              <span>{label} <span aria-hidden="true">{settings[key].toFixed(2).replace(".", ",")}</span></span>
              <input type="range" aria-label={label} min={min} max={max} step={step} value={settings[key]}
                onChange={(event) => onChange({ ...settings, [key]: event.target.valueAsNumber })} />
            </label>;
          })}
        </fieldset>
        <button type="button" onClick={() => onChange(defaultHologramSettings)}>Restaurar padrões</button>
      </div>
      <div className="admin-hologram-preview">
        <p>Prévia do holograma</p>
        <MatrixHologram settings={settings} />
        <small>Publique as alterações para aplicar esta configuração à página inicial.</small>
      </div>
    </div>
  );
}
