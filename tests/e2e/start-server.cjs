const { spawn } = require('node:child_process')
const { cpSync } = require('node:fs')
const path = require('node:path')
const { environment } = require('./environment.cjs')
const { root, port, serverEnv } = environment()
let child
let stopping = false
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    stopping = true
    child?.kill(signal)
})
function run(args) {
    return new Promise((resolve, reject) => {
        child = spawn(process.execPath, args, {
            cwd: root,
            env: { ...process.env, ...serverEnv, HOSTNAME: '127.0.0.1', PORT: port },
            stdio: 'inherit',
        })
        child.once('error', reject)
        child.once('exit', code => code === 0 || stopping ? resolve() : reject(new Error(`Next.js exited with ${code}`)))
    })
}
// Build and launch the same standalone entry point used by the Docker image.
run([require.resolve('next/dist/bin/next'), 'build']).then(() => {
    if (stopping) return
    const standalone = path.join(root, '.next-e2e/standalone')
    cpSync(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true })
    cpSync(path.join(root, '.next-e2e/static'), path.join(standalone, '.next-e2e/static'), { recursive: true })
    return run([path.join(standalone, 'server.js')])
}).catch(error => {
    console.error(error)
    process.exitCode = 1
})
