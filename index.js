/**
 * Host half of the OpenCode Go usage panel.
 *
 * The browser panel asks this Host route for the allowance of the OpenCode
 * Console workspace the stored key belongs to. The route resolves the key
 * itself, so the secret never reaches the page.
 */
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export const name = 'opencode-go-usage'
export const inject = ['connection']

const ENDPOINT = 'opencode-go/usage'
const ROUTE = `/api/${ENDPOINT}`

const DEFAULTS = {
  /** Credential reference DSH resolves before any fallback. */
  apiKeyRef: 'OPENCODE_GO_API_KEY',
  /** Console origin that serves the Go allowance endpoint. */
  baseUrl: 'https://opencode.ai',
  /** Workspace id some Console accounts need in `x-opencode-org-id`. */
  workspaceId: '',
  /** Upper bound for one upstream request, in milliseconds. */
  timeoutMs: 15000,
  /** macOS Keychain service name used when DSH has no stored key. */
  keychainService: 'opencode-go-api-key',
}

/** Register the usage RPC that the panel calls through the Host connection. */
export function apply(ctx, config) {
  const options = { ...DEFAULTS, ...(config ?? {}) }
  const dispose = ctx.connection.fetch.register({
    path: ROUTE,
    methods: ['POST'],
    requestBody: 'buffered',
    async fetch(request) {
      let rpcId = null
      try {
        const body = await request.json()
        rpcId = typeof body?.rpcId === 'string' ? body.rpcId : null
        if (body?.type !== 'client-request' || body?.method !== ENDPOINT) {
          return Response.json(envelope(rpcId, failure('bad_request', 'Invalid usage request')))
        }
        const value = await usage(ctx, options, request.signal)
        return Response.json(envelope(rpcId, { ok: true, value }))
      } catch (error) {
        if (error?.name === 'AbortError') return new Response(null, { status: 499 })
        return Response.json(envelope(rpcId, failure(codeOf(error), messageOf(error))))
      }
    },
  })
  ctx.effect(() => () => void dispose(), 'opencode-go-usage: usage route')
}

/** One response envelope for the shared `/api` channel. */
function envelope(rpcId, result) {
  return { type: 'server-response', rpcId, result }
}

function failure(code, message, details = {}) {
  return { ok: false, error: { code, message, details } }
}

/** Resolve the key, read the allowance, and normalize it for the panel. */
async function usage(ctx, options, signal) {
  const key = await findKey(ctx, options)
  if (key === null) throw coded('no_key', 'No OpenCode Go API key is configured')

  const controller = new AbortController()
  let timedOut = false
  const forward = () => controller.abort()
  if (signal?.aborted) controller.abort()
  else signal?.addEventListener('abort', forward, { once: true })
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, Math.max(1000, Number(options.timeoutMs) || DEFAULTS.timeoutMs))

  try {
    const headers = {
      accept: 'application/json',
      authorization: `Bearer ${key.value}`,
      'user-agent': 'dsh-opencode-go-usage/1.0',
    }
    if (typeof options.workspaceId === 'string' && options.workspaceId !== '') {
      headers['x-opencode-org-id'] = options.workspaceId
    }
    const response = await fetch(new URL('/zen/go/v1/usage', options.baseUrl), {
      method: 'GET',
      headers,
      signal: controller.signal,
    })
    if (response.status === 401) {
      throw coded('unauthorized', 'The OpenCode API key expired or was revoked')
    }
    if (response.status === 403) throw coded('forbidden', 'This key has no OpenCode Go subscription')
    if (!response.ok) throw coded(`http_${response.status}`, `opencode.ai answered ${response.status}`)

    let body
    try {
      body = await response.json()
    } catch {
      throw coded('invalid_response', 'opencode.ai returned a non-JSON answer')
    }
    return {
      go: {
        rolling: meter(body?.usage?.rolling, 'rolling'),
        weekly: meter(body?.usage?.weekly, 'weekly'),
        monthly: meter(body?.usage?.monthly, 'monthly'),
      },
      keySource: key.source,
      fetchedAt: Date.now(),
    }
  } catch (error) {
    if (timedOut) throw coded('timeout', 'opencode.ai did not answer in time')
    if (signal?.aborted) throw error
    if (codeOf(error) !== 'internal') throw error
    throw coded('network', `Could not reach opencode.ai: ${messageOf(error)}`)
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forward)
  }
}

/** One Go allowance window: how much is used, whether Go blocks, when it resets. */
function meter(input, key) {
  if (input === null || typeof input !== 'object' || typeof input.percent !== 'number' || !Number.isFinite(input.percent)) {
    throw coded('invalid_response', `usage.${key}.percent is missing`)
  }
  const resetsAt = Date.parse(input.resetsAt)
  if (!Number.isFinite(resetsAt)) {
    throw coded('invalid_response', `usage.${key}.resetsAt is not a date`)
  }
  return {
    percent: Math.min(100, Math.max(0, input.percent)),
    limited: input.status === 'rate-limited',
    resetsAt,
  }
}

/** First usable key: plugin config, DSH credentials, environment, Keychain, opencode sign-in. */
async function findKey(ctx, options) {
  if (typeof options.apiKey === 'string' && options.apiKey !== '') {
    return { value: options.apiKey, source: 'config' }
  }
  const credentials = ctx.get('credentials')
  if (credentials?.resolve) {
    try {
      const hit = await credentials.resolve(options.apiKeyRef)
      if (typeof hit?.value === 'string' && hit.value !== '') return { value: hit.value, source: 'dsh' }
    } catch {
      /* An unavailable store falls through to the remaining sources. */
    }
  }
  const ambient = process.env?.[options.apiKeyRef]
  if (typeof ambient === 'string' && ambient !== '') return { value: ambient, source: 'env' }
  const keychain = await fromKeychain(options.keychainService)
  if (keychain !== null) return { value: keychain, source: 'keychain' }
  const stored = await fromOpencodeSignIn()
  if (stored !== null) return { value: stored, source: 'opencode' }
  return null
}

async function fromKeychain(service) {
  if (process.platform !== 'darwin' || typeof service !== 'string' || service === '') return null
  try {
    const { stdout } = await execFileAsync('security', ['find-generic-password', '-s', service, '-w'], {
      timeout: 5000,
    })
    const value = stdout.trim()
    return value === '' ? null : value
  } catch {
    return null
  }
}

async function fromOpencodeSignIn() {
  const file = join(homedir(), '.local', 'share', 'opencode', 'auth.json')
  try {
    const data = JSON.parse(await readFile(file, 'utf8'))
    for (const id of ['opencode-go', 'opencode']) {
      const entry = data?.[id]
      if (typeof entry?.key === 'string' && entry.key !== '') return entry.key
    }
  } catch {
    /* Missing or malformed sign-in data simply means no fallback key. */
  }
  return null
}

function coded(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

function codeOf(error) {
  return typeof error?.code === 'string' ? error.code : 'internal'
}

function messageOf(error) {
  const message = typeof error?.message === 'string' ? error.message : ''
  return message === '' ? 'Usage request failed' : message.slice(0, 300)
}
