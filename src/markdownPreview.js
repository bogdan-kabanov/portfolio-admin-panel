// Mirror of the public site's markdown renderer with one extra feature:
// image syntax `![alt](url)` is rendered as <img>. Used only for the admin
// preview tab — the data shape stays a plain markdown string.

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inline(text) {
  let out = text.replace(/`([^`]+?)`/g, (_, c) => `\u0001CODE${encodeURIComponent(c)}\u0001`)
  out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/(^|[^*])\*([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
  // images first so [..](..) doesn't eat the alt of an image
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const safe = /^(https?:\/\/|\/)/i.test(src) ? src : ''
    if (!safe) return ''
    return `<img src="${safe}" alt="${alt}" loading="lazy" style="max-width:100%;border-radius:8px" />`
  })
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, href) => {
    const safe = /^(https?:\/\/|mailto:|\/)/i.test(href) ? href : '#'
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${t}</a>`
  })
  out = out.replace(/\u0001CODE([^\u0001]+)\u0001/g, (_, c) => `<code>${decodeURIComponent(c)}</code>`)
  return out
}

export function renderMarkdown(src) {
  if (!src) return ''
  const escaped = escapeHtml(src)
  const lines = escaped.split(/\r?\n/)
  const out = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^```/.test(line)) {
      const buf = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++
      out.push(`<pre><code>${buf.join('\n')}</code></pre>`)
      continue
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      out.push(`<h${level}>${inline(h[2])}</h${level}>`)
      i++
      continue
    }

    if (/^\s*>\s?/.test(line)) {
      const buf = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`)
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const buf = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        buf.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ul>${buf.join('')}</ul>`)
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        buf.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ol>${buf.join('')}</ol>`)
      continue
    }

    if (/^\s*$/.test(line)) {
      i++
      continue
    }

    const buf = [line]
    i++
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,6}\s|```|\s*[-*]\s|\s*\d+\.\s|\s*>\s?)/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    out.push(`<p>${inline(buf.join(' '))}</p>`)
  }

  return out.join('\n')
}
