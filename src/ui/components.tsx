export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span
      className="brand-mark"
      style={{ '--brand-mark-size': `${size}px` } as React.CSSProperties}
    >
      <svg aria-hidden="true" viewBox="0 0 36 36">
        <path d="M10.3 11.2c3.1-3.7 8.4-5.1 12.9-3.3 4.7 1.8 7.5 6.6 6.8 11.5-.8 5.3-5.3 9.3-10.7 9.5-5.6.2-10.4-3.8-11.2-9.3-.4-3 .4-6 2.2-8.4Z" />
        <path
          className="brand-mark__cut"
          d="M13.1 15.3c1.7-2 4.6-2.7 7-1.8 2.5 1 4.1 3.5 3.7 6.2-.4 2.8-2.9 5-5.8 5.1-3 .1-5.6-2.1-6-5.1-.2-1.6.2-3.2 1.1-4.4Z"
        />
      </svg>
    </span>
  );
}

export function PanelHeader({ eyebrow }: { eyebrow: string }) {
  return (
    <header className="panel-header">
      <BrandMark />
      <div className="panel-header__copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1>Low Cortisol</h1>
      </div>
    </header>
  );
}

type SwitchRowProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description?: string;
  onChange: (checked: boolean) => void;
  prominent?: boolean;
};

export function SwitchRow({
  checked,
  disabled = false,
  label,
  description,
  onChange,
  prominent = false,
}: SwitchRowProps) {
  return (
    <div className={`setting-row${prominent ? ' setting-row--prominent' : ''}`}>
      <button
        type="button"
        className="setting-row__button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="setting-row__copy">
          <span className="setting-row__label">{label}</span>
          {description ? <span className="setting-row__description">{description}</span> : null}
        </span>
        <span className="switch" aria-hidden="true" data-checked={checked}>
          <span className="switch__thumb" />
        </span>
      </button>
    </div>
  );
}
