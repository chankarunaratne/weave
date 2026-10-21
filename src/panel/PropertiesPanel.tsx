import type { ReactNode } from 'react'

export function PropertiesPanel() {
  return (
    <aside className="panel" aria-label="Properties">
      <header className="panel-head">
        <p className="crumb">
          <span>PricingCard</span>
          <span className="crumb-sep" aria-hidden="true">
            /
          </span>
          <span>h2</span>
        </p>
        <h1 className="panel-title">Heading</h1>
      </header>

      <div className="panel-scroll">
        <section className="section" aria-label="Layout">
          <h2 className="section-title">Layout</h2>
          <div className="stack">
            <SelectField label="Display" value="Flex" />
            <div className="icon-row" role="group" aria-label="Direction">
              <IconButton label="Row" active>
                <RowIcon />
              </IconButton>
              <IconButton label="Column">
                <ColumnIcon />
              </IconButton>
              <IconButton label="Wrap">
                <WrapIcon />
              </IconButton>
            </div>
            <div className="split">
              <div className="icon-row" role="group" aria-label="Align items">
                <IconButton label="Align start" active>
                  <AlignStartIcon />
                </IconButton>
                <IconButton label="Align center">
                  <AlignCenterIcon />
                </IconButton>
                <IconButton label="Align end">
                  <AlignEndIcon />
                </IconButton>
              </div>
              <div className="icon-row" role="group" aria-label="Justify content">
                <IconButton label="Justify start">
                  <JustifyStartIcon />
                </IconButton>
                <IconButton label="Justify center" active>
                  <JustifyCenterIcon />
                </IconButton>
                <IconButton label="Justify end">
                  <JustifyEndIcon />
                </IconButton>
                <IconButton label="Space between">
                  <JustifyBetweenIcon />
                </IconButton>
              </div>
            </div>
            <Field label="Gap" value="16" />
            <div className="split">
              <SizeField axis="W" value="320" mode="Fixed" />
              <SizeField axis="H" value="Auto" mode="Hug" />
            </div>
            <BoxSides label="Padding" values={['24', '20', '24', '20']} linked />
            <BoxSides label="Margin" values={['0', '0', '0', '0']} linked />
          </div>
        </section>

        <section className="section" aria-label="Text">
          <h2 className="section-title">Text</h2>
          <div className="stack">
            <Field label="Content" value="Pro plan" wide />
            <Field label="Font" value="Inter" wide />
            <div className="split">
              <Field label="Size" value="24" />
              <Field label="Weight" value="Semibold" />
            </div>
            <div className="split">
              <Field label="Line" value="32" />
              <Field label="Spacing" value="0" />
            </div>
            <div className="split align-color">
              <div className="icon-row" role="group" aria-label="Text alignment">
                <IconButton label="Align left" active>
                  <TextLeftIcon />
                </IconButton>
                <IconButton label="Align center">
                  <TextCenterIcon />
                </IconButton>
                <IconButton label="Align right">
                  <TextRightIcon />
                </IconButton>
              </div>
              <ColorField label="Color" hex="111111" swatch="#111111" />
            </div>
          </div>
        </section>

        <section className="section" aria-label="Fill">
          <h2 className="section-title">Fill</h2>
          <ColorField label="Background" hex="FFFFFF" swatch="#ffffff" />
        </section>

        <section className="section" aria-label="Stroke">
          <h2 className="section-title">Stroke</h2>
          <div className="stack">
            <div className="split stroke-row">
              <Field label="Width" value="1" />
              <SelectField label="Style" value="Solid" />
            </div>
            <ColorField label="Border color" hex="E6E6E6" swatch="#e6e6e6" />
            <div className="radius-line">
              <Field label="Radius" value="12" />
              <IconButton label="Link corners" active>
                <LinkIcon />
              </IconButton>
            </div>
            <div className="corners" aria-label="Corner radius">
              <Field label="Top left" value="12" />
              <Field label="Top right" value="12" />
              <Field label="Bottom right" value="12" />
              <Field label="Bottom left" value="12" />
            </div>
          </div>
        </section>

        <section className="section" aria-label="Effects">
          <h2 className="section-title">Effects</h2>
          <div className="stack">
            <Field label="Opacity" value="100%" />
            <Field label="Shadow" value="0 8px 24px #0000001f" wide />
          </div>
        </section>
      </div>
    </aside>
  )
}

function Field({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <label className={wide ? 'field field-wide' : 'field'}>
      <span className="field-label">{label}</span>
      <input className="field-input" value={value} readOnly />
    </label>
  )
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="field field-wide">
      <span className="field-label">{label}</span>
      <span className="select-value">
        <input className="field-input" value={value} readOnly />
        <ChevronIcon />
      </span>
    </label>
  )
}

function SizeField({
  axis,
  value,
  mode,
}: {
  axis: string
  value: string
  mode: 'Fixed' | 'Hug' | 'Fill'
}) {
  return (
    <div className="size-field">
      <label className="field">
        <span className="field-label">{axis}</span>
        <input className="field-input" value={value} readOnly aria-label={`${axis} size`} />
      </label>
      <div className="modes" role="group" aria-label={`${axis} mode`}>
        {(['Fixed', 'Hug', 'Fill'] as const).map((item) => (
          <span key={item} className={item === mode ? 'mode mode-on' : 'mode'}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function ColorField({
  label,
  hex,
  swatch,
}: {
  label: string
  hex: string
  swatch: string
}) {
  return (
    <label className="field field-wide color-field">
      <span className="field-label">{label}</span>
      <span className="color-value">
        <span className="swatch" style={{ background: swatch }} />
        <input className="field-input" value={hex} readOnly />
      </span>
    </label>
  )
}

function BoxSides({
  label,
  values,
  linked,
}: {
  label: string
  values: [string, string, string, string]
  linked: boolean
}) {
  const sides = ['Top', 'Right', 'Bottom', 'Left'] as const
  return (
    <div className="sides">
      <span className="sides-label">{label}</span>
      <div className="sides-fields">
        {sides.map((side, index) => (
          <label className="field" key={side}>
            <span className="field-label">{side[0]}</span>
            <input
              className="field-input"
              value={values[index]}
              readOnly
              aria-label={`${label} ${side}`}
            />
          </label>
        ))}
        <IconButton label={`Link ${label.toLowerCase()}`} active={linked}>
          <LinkIcon />
        </IconButton>
      </div>
    </div>
  )
}

function IconButton({
  label,
  active = false,
  children,
}: {
  label: string
  active?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={active ? 'icon-btn icon-btn-on' : 'icon-btn'}
      aria-label={label}
      aria-pressed={active}
      tabIndex={-1}
    >
      {children}
    </button>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path d="M4 6.5 L8 10.5 L12 6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M6.5 9.5 L9.5 6.5 M6 7.2 L4.8 8.4 a2.2 2.2 0 0 0 3.1 3.1 L9.1 10.3 M10 8.8 L11.2 7.6 a2.2 2.2 0 0 0 -3.1 -3.1 L6.9 5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function RowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 8 H13 M10.5 5.5 L13 8 L10.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ColumnIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M8 3 V13 M5.5 10.5 L8 13 L10.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WrapIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 5 H11 M3 8 H8 M3 11 H6 M11 5 V9 H8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AlignStartIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 3 H13 M3 6.5 H9 M3 10 H11 M3 13.5 H7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function AlignCenterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 3 H13 M5 6.5 H11 M4 10 H12 M6 13.5 H10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function AlignEndIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 3 H13 M7 6.5 H13 M5 10 H13 M9 13.5 H13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function JustifyStartIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 3 V13 M6 5 H9 M6 8 H11 M6 11 H8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function JustifyCenterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4 5 H12 M5 8 H11 M6 11 H10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function JustifyEndIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M13 3 V13 M7 5 H10 M5 8 H10 M8 11 H10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function JustifyBetweenIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 3 V13 M13 3 V13 M6 6 H10 M6 10 H10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function TextLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 4 H13 M3 8 H10 M3 12 H12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function TextCenterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 4 H13 M5 8 H11 M4 12 H12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function TextRightIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 4 H13 M6 8 H13 M4 12 H13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
