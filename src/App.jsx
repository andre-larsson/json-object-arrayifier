import { useState } from 'react'
import './App.css'

const SAMPLE_INPUT = `{"id":1,"name":"Ada","tags":["math","logic"]}
{"id":2,"name":"Linus","meta":{"active":true}}
{"id":3,"name":"Grace","notes":"brace in string: { ok }"}`

function parseObjectStream(source) {
  const objects = []
  let cursor = 0

  while (cursor < source.length) {
    while (cursor < source.length && /\s/.test(source[cursor])) {
      cursor += 1
    }

    if (cursor >= source.length) {
      break
    }

    if (source[cursor] !== '{') {
      throw new Error(`Expected "{" at character ${cursor + 1}.`)
    }

    let depth = 0
    let inString = false
    let escaping = false
    const start = cursor

    for (; cursor < source.length; cursor += 1) {
      const character = source[cursor]

      if (inString) {
        if (escaping) {
          escaping = false
          continue
        }

        if (character === '\\') {
          escaping = true
          continue
        }

        if (character === '"') {
          inString = false
        }

        continue
      }

      if (character === '"') {
        inString = true
        continue
      }

      if (character === '{') {
        depth += 1
        continue
      }

      if (character === '}') {
        depth -= 1

        if (depth === 0) {
          const snippet = source.slice(start, cursor + 1)
          objects.push(JSON.parse(snippet))
          cursor += 1
          break
        }
      }
    }

    if (depth !== 0 || inString) {
      throw new Error('Input ended before a JSON object was closed.')
    }
  }

  return objects
}

function App() {
  const [input, setInput] = useState(SAMPLE_INPUT)
  const [output, setOutput] = useState(
    JSON.stringify(parseObjectStream(SAMPLE_INPUT), null, 2),
  )
  const [error, setError] = useState('')
  const [copyLabel, setCopyLabel] = useState('Copy output')

  function convert(nextInput = input) {
    try {
      const arrayified = parseObjectStream(nextInput)
      setOutput(JSON.stringify(arrayified, null, 2))
      setError('')
      setCopyLabel('Copy output')
    } catch (nextError) {
      setError(nextError.message)
      setCopyLabel('Copy output')
    }
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output)
      setCopyLabel('Copied')
    } catch {
      setCopyLabel('Copy failed')
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">JSON Object Arrayifier</p>
        <h1>Turn whitespace-separated JSON objects into one valid array.</h1>
        <p className="lede">
          Paste a stream like <code>{'{"a":1} {"b":2}'}</code> or one object per
          line, then get <code>[...]</code> output you can feed to tools that
          expect a proper JSON array.
        </p>
      </section>

      <section className="workspace">
        <label className="panel">
          <span className="panel-title">Input</span>
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setCopyLabel('Copy output')
            }}
            spellCheck="false"
            aria-label="Input JSON objects"
          />
        </label>

        <div className="actions">
          <button type="button" onClick={() => convert()}>
            Convert to array
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              setInput(SAMPLE_INPUT)
              convert(SAMPLE_INPUT)
            }}
          >
            Load sample
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={copyOutput}
          >
            {copyLabel}
          </button>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <label className="panel">
          <span className="panel-title">Output</span>
          <textarea
            value={output}
            readOnly
            spellCheck="false"
            aria-label="Output JSON array"
          />
        </label>
      </section>
    </main>
  )
}

export default App
