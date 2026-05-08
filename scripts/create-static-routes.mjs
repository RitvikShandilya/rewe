import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

await copyFile('dist/index.html', 'dist/404.html');

await mkdir('dist/pwa', { recursive: true });
await copyFile('dist/index.html', 'dist/pwa/index.html');

await mkdir('dist/pwa2', { recursive: true });
const indexHtml = await readFile('dist/index.html', 'utf8');
const pwa2Html = indexHtml
  .replace(
    'content="width=device-width, initial-scale=1.0, viewport-fit=cover"',
    'content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"',
  )
  .replace('/rewe/manifest.webmanifest', '/rewe/manifest-pwa2.webmanifest')
  .replace('<meta name="theme-color" content="#008a7a" />', '<meta name="theme-color" content="#000000" />')
  .replace(
    '<meta name="apple-mobile-web-app-title" content="REWE Prototype" />',
    '<meta name="apple-mobile-web-app-title" content="REWE Figma" />',
  )
  .replace(
    '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  )
  .replace('<title>REWE Loyalty Click Prototype</title>', '<title>REWE Figma Prototype</title>');

await writeFile('dist/pwa2/index.html', pwa2Html);
