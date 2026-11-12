import { useState } from 'react';
import katex from 'katex';

// Block registry: add a new content type by adding one entry. No per-question-type screens.
const Tex = ({ tex, display }) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false, displayMode: !!display }) }} />;
// Inline $...$ inside text is rendered as math
const Text = ({ text }) => <p className="txt">{text.split(/(\$[^$]+\$)/g).map((p, i) => (p.startsWith('$') ? <Tex key={i} tex={p.slice(1, -1)} /> : p))}</p>;
const Img = ({ src, alt }) => { const [zoom, setZoom] = useState(false);
  return (<>
    <button type="button" className="imgbtn" onClick={() => setZoom(true)} title="Click to zoom"><img src={src} alt={alt || ''} /></button>
    {zoom && <div className="zoom" role="dialog" onClick={() => setZoom(false)}><img src={src} alt={alt || ''} /><span>Tap anywhere to close</span></div>}</>); };
const Table = ({ head, rows }) => (<div className="tablewrap"><table><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
  <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>);

export const registry = {
  text: (b) => <Text text={b.text} />, math: (b) => <Tex tex={b.tex} display />, image: (b) => <Img {...b} />, table: (b) => <Table {...b} /> };
export const Blocks = ({ blocks }) => blocks.map((b, i) => <div className={'blk blk-' + b.type} key={i}>{(registry[b.type] || (() => null))(b)}</div>);
