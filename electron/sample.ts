export type FrameRecord = {
  id: string
  name: string
  html: string
  css: string
  x: number
  y: number
  width?: number
  sourceFile?: string
}

const pricingCss = `
.card {
  width: 280px;
  box-sizing: border-box;
  background: #ffffff;
  color: #171717;
  border-radius: 16px;
  padding: 24px;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #737373;
}
h2 {
  margin: 8px 0 0;
  font-size: 24px;
  line-height: 32px;
}
.price {
  margin: 12px 0 0;
  font-size: 36px;
  line-height: 40px;
  font-weight: 600;
}
.price span {
  font-size: 14px;
  font-weight: 400;
  color: #737373;
}
ul {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}
li {
  padding: 8px 0;
  border-top: 1px solid #eeeeee;
  font-size: 14px;
  line-height: 20px;
}
button {
  margin-top: 16px;
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background: #171717;
  color: #ffffff;
  font-size: 14px;
}
`.trim()

const pricingHtml = `
<article class="card">
  <p class="eyebrow">Pricing</p>
  <h2>Pro plan</h2>
  <p class="price">$29<span>/mo</span></p>
  <ul>
    <li>Unlimited projects</li>
    <li>Shared canvas</li>
    <li>Priority support</li>
  </ul>
  <button type="button">Choose Pro</button>
</article>
`.trim()

const badgeCss = `
.badge {
  display: inline-block;
  background: #0d99ff;
  color: #ffffff;
  font: 600 12px ui-sans-serif, system-ui, sans-serif;
  padding: 6px 10px;
  border-radius: 999px;
}
`.trim()

export function sampleFrames(): FrameRecord[] {
  return [
    {
      id: 'frame_pricing_card',
      name: 'PricingCard',
      sourceFile: 'components/PricingCard',
      x: 96,
      y: 96,
      html: pricingHtml,
      css: pricingCss,
    },
    {
      id: 'frame_badge',
      name: 'Badge',
      sourceFile: 'components/Badge',
      x: 440,
      y: 140,
      html: '<span class="badge">New</span>',
      css: badgeCss,
    },
  ]
}
