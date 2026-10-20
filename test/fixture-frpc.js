import { readFileSync } from 'node:fs'
const args = process.argv.slice(2)
const file = args[args.indexOf('-c') + 1]
if (!readFileSync(file, 'utf8').includes('DSH_FRPC_AUTH_TOKEN')) process.exit(3)
if (args[0] === 'verify') {
  if (process.env.DSH_FRPC_AUTH_TOKEN === 'verify-fail') {
    console.error('bad secret: verify-fail'); process.exit(2)
  }
  process.exit(0)
}
if (process.env.DSH_FRPC_AUTH_TOKEN === 'exit-fast') process.exit(7)
process.stdout.write('[proxy] start proxy suc')
setTimeout(() => process.stdout.write('cess\n'), 20)
process.on('SIGTERM', () => process.exit(0))
setInterval(() => {}, 1000)
