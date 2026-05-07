import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';

const figmaToken = process.env.FIGMA_TOKEN;

if (!figmaToken) {
  throw new Error('Set FIGMA_TOKEN before running this script.');
}

const fileKey = 'XIiPagYAEkq2gtLIkqWiwV';
const scale = Number(process.env.FIGMA_EXPORT_SCALE ?? '3');
const cropTopCssPx = 48;
const outputDir = resolve('src/assets/pwa');

const frames = [
  ['screen-01.png', '272:6032'],
  ['screen-02.png', '272:5931'],
  ['screen-03.png', '272:6364'],
  ['screen-04.png', '272:5967'],
  ['screen-05.png', '272:5651'],
  ['screen-06.png', '272:6468'],
  ['screen-07.png', '272:5705'],
  ['screen-08.png', '272:6052'],
  ['screen-09.png', '272:6390'],
  ['screen-10.png', '272:5760'],
  ['screen-11.png', '272:5611'],
  ['screen-12.png', '272:5853'],
  ['screen-13.png', '272:6495'],
  ['screen-14.png', '272:5784'],
  ['screen-15.png', '272:5835'],
  ['screen-16.png', '272:6349'],
  ['screen-17.png', '272:5902'],
];

function assertOk(response, context) {
  if (!response.ok) {
    throw new Error(`${context} failed: ${response.status} ${response.statusText}`);
  }
}

async function renderFrameUrls() {
  const params = new URLSearchParams({
    ids: frames.map(([, id]) => id).join(','),
    format: 'png',
    scale: String(scale),
  });

  const response = await fetch(`https://api.figma.com/v1/images/${fileKey}?${params}`, {
    headers: {
      'X-Figma-Token': figmaToken,
    },
  });

  assertOk(response, 'Figma render request');
  const body = await response.json();

  if (body.err) {
    throw new Error(`Figma render error: ${body.err}`);
  }

  return body.images;
}

async function download(url, targetPath) {
  const response = await fetch(url);
  assertOk(response, `Download ${targetPath}`);
  await mkdir(dirname(targetPath), { recursive: true });
  await pipeline(response.body, createWriteStream(targetPath));
}

async function cropPng(sourcePath, targetPath) {
  const cropTopPx = cropTopCssPx * scale;
  const width = 393 * scale;
  const height = (852 - cropTopCssPx) * scale;

  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(
    'python3',
    [
      resolve('scripts/crop-pwa-export.py'),
      sourcePath,
      targetPath,
      String(cropTopPx),
      String(width),
      String(height),
      String(scale),
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    throw new Error(`PNG crop failed for ${sourcePath}: ${result.stderr || result.stdout}`);
  }
}

const images = await renderFrameUrls();
const manifest = {
  fileKey,
  scale,
  cropTopCssPx,
  frames: [],
};

for (const [fileName, nodeId] of frames) {
  const url = images[nodeId];
  if (!url) {
    throw new Error(`Figma did not return an image URL for ${nodeId} (${fileName}).`);
  }

  const rawPath = resolve('.tmp-figma-export-raw', fileName);
  const outputPath = resolve(outputDir, fileName);

  await download(url, rawPath);
  await cropPng(rawPath, outputPath);
  manifest.frames.push({ fileName, nodeId });
  console.log(`exported ${fileName}`);
}

await writeFile(resolve('.tmp-figma-export-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
