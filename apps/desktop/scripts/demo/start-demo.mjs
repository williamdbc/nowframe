import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const child = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--', ...process.argv.slice(2)],
  {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    env: { ...process.env, VITE_THEME_SHOWCASE: 'true' },
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
