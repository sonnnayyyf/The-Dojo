// Reads/writes the `const NAME=...;` JSON blobs embedded inline in the course HTML files,
// without needing a full HTML/JS parser. Finds the JSON value after the marker by counting
// brace/bracket depth (string-aware), so it works regardless of formatting.
import fs from 'node:fs';

export function extractBalanced(text, fromIndex) {
  let i = fromIndex;
  while (text[i] !== '{' && text[i] !== '[') i++;
  const open = text[i];
  const close = open === '{' ? '}' : ']';
  const start = i;
  let depth = 0, inStr = false, esc = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === open) depth++;
      else if (c === close) {
        depth--;
        if (depth === 0) { i++; break; }
      }
    }
  }
  return { text: text.slice(start, i), start, end: i };
}

export function readConst(html, name) {
  const marker = `const ${name}=`;
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) throw new Error(`const ${name} not found in file`);
  const { text, start, end } = extractBalanced(html, markerIdx + marker.length);
  return { value: JSON.parse(text), start, end };
}

export function replaceConst(html, name, newValue) {
  const { start, end } = readConst(html, name);
  return html.slice(0, start) + JSON.stringify(newValue) + html.slice(end);
}

export function loadCourseFile(path) {
  return fs.readFileSync(path, 'utf8');
}

export function saveCourseFile(path, html) {
  fs.writeFileSync(path, html, 'utf8');
}
