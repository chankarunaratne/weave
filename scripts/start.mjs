import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rendererUrl = 'http://127.0.0.1:5173'

function bin(name) {
  return path.join(root, 'node_modules', '.bin', name)
}

function spawnInherit(command, args, env) {
  return spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  })
}

function waitForExit(child) {
  return new Promise((resolve) => {
    child.on('exit', (code, signal) => {
      resolve(signal ? 1 : (code ?? 1))
    })
  })
}

function waitForPort(port, host, timeoutMs) {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.connect({ port, host }, () => {
        socket.end()
        resolve()
      })
      socket.on('error', () => {
        socket.destroy()
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`))
          return
        }
        setTimeout(tryConnect, 200)
      })
    }
    tryConnect()
  })
}

function stopChild(child) {
  if (!child || child.killed || child.exitCode !== null) return
  child.kill('SIGTERM')
}

async function main() {
  const tsc = spawnInherit(bin('tsc'), ['-p', 'tsconfig.electron.json'])
  const tscCode = await waitForExit(tsc)
  if (tscCode !== 0) {
    process.exit(tscCode)
  }

  const vite = spawnInherit(bin('vite'), [
    '--host',
    '127.0.0.1',
    '--port',
    '5173',
    '--strictPort',
  ])

  let electron
  let shuttingDown = false

  function shutdown(code) {
    if (shuttingDown) return
    shuttingDown = true
    stopChild(electron)
    stopChild(vite)
    setTimeout(() => {
      if (electron && electron.exitCode === null) electron.kill('SIGKILL')
      if (vite.exitCode === null) vite.kill('SIGKILL')
      process.exit(code)
    }, 500)
  }

  process.on('SIGINT', () => {
    shutdown(0)
  })
  process.on('SIGTERM', () => {
    shutdown(0)
  })

  vite.on('exit', (code) => {
    if (shuttingDown) return
    shutdown(code === 0 ? 0 : (code ?? 1))
  })

  try {
    await waitForPort(5173, '127.0.0.1', 20000)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    shutdown(1)
    return
  }

  if (shuttingDown) return

  electron = spawnInherit(bin('electron'), ['.'], {
    WEAVE_RENDERER_URL: rendererUrl,
  })

  electron.on('exit', (code) => {
    if (shuttingDown) return
    shutdown(code === 0 ? 0 : (code ?? 1))
  })
}

void main()
