export function buildSrcdoc(html: string, css: string): string {
  const safeCss = css.replace(/<\/style/gi, '<\\/style')
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8">',
    '<style>html,body{margin:0;padding:0;}</style>',
    `<style>${safeCss}</style>`,
    '</head>',
    `<body>${html}</body>`,
    '</html>',
  ].join('')
}
