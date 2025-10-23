'use client'

import { useState } from 'react'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <main className="main">
      <div className="container">
        <h1>Next.js + TypeScript</h1>
        <p>Built with Dockerfile Generator! 🐳</p>
        
        <div className="card">
          <button onClick={() => setCount(count + 1)}>
            Count is {count}
          </button>
          <p>
            Edit <code>app/page.tsx</code> and save to test HMR
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h2>Features &rarr;</h2>
            <p>TypeScript support with Next.js 14</p>
          </div>

          <div className="card">
            <h2>Docker &rarr;</h2>
            <p>Production-ready containerization</p>
          </div>

          <div className="card">
            <h2>Performance &rarr;</h2>
            <p>Optimized for production deployment</p>
          </div>
        </div>
      </div>
    </main>
  )
}

