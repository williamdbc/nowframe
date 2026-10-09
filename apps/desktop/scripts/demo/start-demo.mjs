import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'

const demoEnv = { ...process.env, VITE_THEME_SHOWCASE: 'true' }
if (process.platform === 'darwin') {
  const cache = fileURLToPath(new URL('../../node_modules/.cache/nowframe-demo/', import.meta.url))
  mkdirSync(cache, { recursive: true })
  const binary = `${cache}native-cursor`
  const compiled = spawnSync(
    'xcrun',
    ['swiftc', fileURLToPath(new URL('./native-cursor.swift', import.meta.url)), '-o', binary],
    { stdio: 'inherit' }
  )
  if (compiled.error || compiled.status !== 0) {
    console.error(
      'Não foi possível compilar o controlador do mouse. Verifique as Command Line Tools do Xcode.'
    )
    process.exit(1)
  }
  demoEnv.VITE_DEMO_REAL_CURSOR = 'true'
  demoEnv.NOWFRAME_DEMO_CURSOR_HELPER = binary
}

const child = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--', ...process.argv.slice(2)],
  {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    env: demoEnv,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  }
)

child.on('error', (error) => {
  console.error(error.message)
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 0
})
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}
