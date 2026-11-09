window.__ModuleLoader__.load({
  id: '@local/dsh-opencode-go-usage',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'opencode-go-usage'
    const PANEL_ID = 'opencode-go-usage'
    const ENDPOINT = 'opencode-go/usage'
    const REFRESH_MS = 60000
    const CONSOLE_URL = 'https://opencode.ai/console/go'

    const EN = {
      panel: 'OpenCode Go',
      title: 'OpenCode Go usage',
      subtitle: 'Allowance and reset times for your Go subscription',
      rolling: 'Current window',
      rollingHint: '5-hour limit',
      weekly: 'Week',
      weeklyHint: 'Weekly limit',
      monthly: 'Month',
      monthlyHint: 'Monthly limit',
      percent: '%',
      resets: 'Resets {when}',
      limited: 'Limit reached · resets {when}',
      limitedBadge: 'Limit reached',
      refresh: 'Refresh',
      refreshing: 'Refreshing…',
      loading: 'Loading usage…',
      updated: 'Updated {when}',
      errorTitle: 'Could not load usage',
      'error.no_key': 'No OpenCode API key found. Add OPENCODE_GO_API_KEY to DSH credentials.',
      'error.unauthorized': 'The key expired or was revoked. Update it in OpenCode Console.',
      'error.forbidden': 'This key has no Go subscription.',
      'error.timeout': 'opencode.ai did not answer in time.',
      'error.network': 'Could not reach opencode.ai. Check your connection.',
      'error.invalid_response': 'opencode.ai returned an unexpected response.',
      'error.unknown': 'Loading usage failed.',
      retry: 'Try again',
      stale: 'Refresh failed; showing the previous data.',
      openConsole: 'Open Console',
      keySource: 'Key source: {source}',
      'key.dsh': 'DSH credentials',
      'key.env': 'environment variable',
      'key.keychain': 'Keychain',
      'key.opencode': 'opencode sign-in',
      'key.config': 'plugin settings',
    }

    const RU = {
      panel: 'OpenCode Go',
      title: 'OpenCode Go',
      subtitle: 'Расход и время сброса для подписки Go',
      rolling: 'Сейчас',
      rollingHint: 'Лимит за 5 часов',
      weekly: 'Неделя',
      weeklyHint: 'Лимит за неделю',
      monthly: 'Месяц',
      monthlyHint: 'Лимит за месяц',
      percent: '%',
      resets: 'Сброс {when}',
      limited: 'Лимит исчерпан · сброс {when}',
      limitedBadge: 'Лимит исчерпан',
      refresh: 'Обновить',
      refreshing: 'Обновляю…',
      loading: 'Загружаю лимиты…',
      updated: 'Обновлено в {when}',
      errorTitle: 'Не удалось загрузить лимиты',
      'error.no_key': 'Не найден ключ OpenCode. Добавь OPENCODE_GO_API_KEY в ключи DSH.',
      'error.unauthorized': 'Ключ истёк или отозван. Обнови его в консоли OpenCode.',
      'error.forbidden': 'По этому ключу нет подписки Go.',
      'error.timeout': 'opencode.ai не ответил вовремя.',
      'error.network': 'Нет связи с opencode.ai. Проверь интернет.',
      'error.invalid_response': 'opencode.ai вернул неожиданный ответ.',
      'error.unknown': 'Не получилось загрузить лимиты.',
      retry: 'Повторить',
      stale: 'Обновление не удалось, показаны прошлые данные.',
      openConsole: 'Открыть консоль',
      keySource: 'Источник ключа: {source}',
      'key.dsh': 'ключи DSH',
      'key.env': 'переменная окружения',
      'key.keychain': 'связка ключей',
      'key.opencode': 'вход opencode',
      'key.config': 'настройки плагина',
    }

    const ZH = {
      panel: 'OpenCode Go',
      title: 'OpenCode Go 用量',
      subtitle: 'Go 订阅的用量与重置时间',
      rolling: '当前窗口',
      rollingHint: '5 小时限额',
      weekly: '本周',
      weeklyHint: '每周限额',
      monthly: '本月',
      monthlyHint: '每月限额',
      percent: '%',
      resets: '{when} 重置',
      limited: '已达限额 · {when} 重置',
      limitedBadge: '已达限额',
      refresh: '刷新',
      refreshing: '刷新中…',
      loading: '正在加载用量…',
      updated: '更新于 {when}',
      errorTitle: '无法加载用量',
      'error.no_key': '未找到 OpenCode API 密钥。请在 DSH 凭据中添加 OPENCODE_GO_API_KEY。',
      'error.unauthorized': '密钥已过期或被撤销。请在 OpenCode Console 中更新。',
      'error.forbidden': '此密钥没有 Go 订阅。',
      'error.timeout': 'opencode.ai 响应超时。',
      'error.network': '无法连接 opencode.ai。请检查网络。',
      'error.invalid_response': 'opencode.ai 返回了无法识别的响应。',
      'error.unknown': '加载用量失败。',
      retry: '重试',
      stale: '刷新失败，显示上一次的数据。',
      openConsole: '打开 Console',
      keySource: '密钥来源：{source}',
      'key.dsh': 'DSH 凭据',
      'key.env': '环境变量',
      'key.keychain': '钥匙串',
      'key.opencode': 'opencode 登录',
      'key.config': '插件设置',
    }

    const KNOWN_ERRORS = new Set([
      'no_key',
      'unauthorized',
      'forbidden',
      'timeout',
      'network',
      'invalid_response',
      'bad_request',
    ])

    const CSS = `
      .ocgo-panel { height: 100%; overflow-y: auto; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
      .ocgo-inner { max-width: 880px; margin: 0 auto; padding: 32px 24px 48px; }
      .ocgo-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
      .ocgo-title { margin: 0; font-size: 24px; line-height: 1.25; font-weight: 600; letter-spacing: -0.01em; }
      .ocgo-sub { margin: 6px 0 0; font-size: 14px; line-height: 1.45; color: var(--dsw-alias-label-secondary); }
      .ocgo-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      .ocgo-btn { appearance: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: transparent; color: var(--dsw-alias-label-primary); padding: 8px 12px; font: inherit; font-size: 14px; line-height: 1.2; cursor: pointer; transition: background-color .15s ease, opacity .15s ease; }
      .ocgo-btn:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-1); }
      .ocgo-btn:active:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }
      .ocgo-btn:disabled { opacity: .55; cursor: default; }
      .ocgo-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
      .ocgo-badge { display: inline-flex; align-items: center; border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; padding: 4px 10px; font-size: 12px; line-height: 1.3; font-weight: 500; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
      .ocgo-badge[data-tone="error"] { color: var(--dsw-alias-state-error-primary); }
      .ocgo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
      .ocgo-card { display: flex; flex-direction: column; gap: 12px; min-height: 172px; padding: 20px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); }
      .ocgo-card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
      .ocgo-card-title { margin: 0; font-size: 15px; line-height: 1.3; font-weight: 600; }
      .ocgo-card-hint { font-size: 12px; line-height: 1.3; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
      .ocgo-value { font-size: 32px; line-height: 1; font-weight: 600; letter-spacing: -0.02em; }
      .ocgo-value small { margin-left: 2px; font-size: 15px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
      .ocgo-bar { height: 6px; border-radius: 999px; background: var(--dsw-alias-border-l1); overflow: hidden; }
      .ocgo-bar > span { display: block; height: 100%; border-radius: 999px; background: var(--dsw-alias-brand-primary); transition: width .4s ease; }
      .ocgo-bar[data-tone="warn"] > span { background: var(--dsw-alias-state-warn-primary); }
      .ocgo-bar[data-tone="error"] > span { background: var(--dsw-alias-state-error-primary); }
      .ocgo-meta { margin: 0; font-size: 13px; line-height: 1.45; color: var(--dsw-alias-label-secondary); }
      .ocgo-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 24px; font-size: 13px; line-height: 1.45; color: var(--dsw-alias-label-secondary); }
      .ocgo-link { color: var(--dsw-alias-brand-primary); text-decoration: none; }
      .ocgo-link:hover { text-decoration: underline; }
      .ocgo-link:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; border-radius: 4px; }
      .ocgo-error { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 24px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); }
      .ocgo-error-title { margin: 0; font-size: 16px; line-height: 1.3; font-weight: 600; }
      .ocgo-error-text { margin: 0; font-size: 15px; line-height: 1.5; }
      .ocgo-error-detail { margin: 0; font-size: 12px; line-height: 1.45; color: var(--dsw-alias-label-secondary); max-width: 640px; overflow-wrap: anywhere; }
      .ocgo-error .ocgo-btn { margin-top: 8px; }
      .ocgo-stale { margin: 0 0 16px; font-size: 13px; line-height: 1.45; color: var(--dsw-alias-state-warn-primary); }
      .ocgo-skeleton { gap: 14px; }
      .ocgo-sk { border-radius: 6px; background: var(--dsw-alias-bg-layer-2); animation: ocgo-pulse 1.4s ease-in-out infinite; }
      .ocgo-sk-title { width: 45%; height: 14px; }
      .ocgo-sk-value { width: 32%; height: 30px; }
      .ocgo-sk-bar { width: 100%; height: 6px; border-radius: 999px; }
      .ocgo-sk-line { width: 70%; height: 12px; }
      @keyframes ocgo-pulse { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
      @media (prefers-reduced-motion: reduce) {
        .ocgo-sk { animation: none; }
        .ocgo-bar > span { transition: none; }
      }
      @media (max-width: 720px) {
        .ocgo-grid { grid-template-columns: 1fr; }
        .ocgo-inner { padding: 24px 16px 40px; }
      }
    `

    const inject = ['slots', 'locale', 'connection']

    function UsageIcon({ size }) {
      const edge = typeof size === 'number' && size > 0 ? size : 18
      return h(
        'svg',
        {
          width: edge,
          height: edge,
          viewBox: '0 0 24 24',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
        },
        h('rect', { x: 3.5, y: 13, width: 4, height: 7.5, rx: 2, fill: 'currentColor' }),
        h('rect', { x: 10, y: 8.5, width: 4, height: 12, rx: 2, fill: 'currentColor' }),
        h('rect', { x: 16.5, y: 4, width: 4, height: 16.5, rx: 2, fill: 'currentColor' })
      )
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh: ZH, en: EN, ru: RU }), 'opencode-go-usage: dictionaries')
      const boundT = ctx.locale.bind(NS)

      function callUsage(signal) {
        const connection = ctx.get('connection')
        if (connection === undefined || typeof connection?.rpc?.call !== 'function') {
          return Promise.reject(Object.assign(new Error('Connection unavailable'), { code: 'network' }))
        }
        return connection.rpc.call('/api', ENDPOINT, {}, signal).then(
          (result) => {
            if (result !== null && typeof result === 'object' && result.ok === true) return result.value
            const error = new Error(result?.error?.message ?? 'Usage request failed')
            error.code = result?.error?.code ?? 'unknown'
            throw error
          },
          (error) => {
            if (error?.name === 'AbortError') throw error
            const wrapped = new Error(error?.message ?? 'Usage request failed')
            wrapped.code = 'network'
            throw wrapped
          }
        )
      }

      function formatWhen(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
        return new Intl.DateTimeFormat(undefined, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(value))
      }

      function formatClock(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
        return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
      }

      function MeterCard({ t, title, hint, meter }) {
        const percent = Math.max(0, Math.min(100, Number(meter?.percent) || 0))
        const shown = percent > 0 && percent < 1 ? '<1' : String(Math.round(percent))
        const tone = meter?.limited || percent >= 100 ? 'error' : percent >= 75 ? 'warn' : 'ok'
        return h(
          'section',
          { className: 'ocgo-card' },
          h(
            'div',
            { className: 'ocgo-card-head' },
            h('h2', { className: 'ocgo-card-title' }, title),
            h('span', { className: 'ocgo-card-hint' }, hint)
          ),
          h('div', { className: 'ocgo-value' }, shown, h('small', null, t('percent'))),
          h(
            'div',
            {
              className: 'ocgo-bar',
              'data-tone': tone,
              role: 'progressbar',
              'aria-valuemin': 0,
              'aria-valuemax': 100,
              'aria-valuenow': Math.round(percent),
              'aria-label': title,
            },
            h('span', { style: { width: `${percent}%` } })
          ),
          h(
            'p',
            { className: 'ocgo-meta' },
            meter?.limited
              ? t('limited', { when: formatWhen(meter?.resetsAt) })
              : t('resets', { when: formatWhen(meter?.resetsAt) })
          )
        )
      }

      function SkeletonCard() {
        return h(
          'section',
          { className: 'ocgo-card ocgo-skeleton', 'aria-hidden': 'true' },
          h('div', { className: 'ocgo-sk ocgo-sk-title' }),
          h('div', { className: 'ocgo-sk ocgo-sk-value' }),
          h('div', { className: 'ocgo-sk ocgo-sk-bar' }),
          h('div', { className: 'ocgo-sk ocgo-sk-line' })
        )
      }

      function ErrorState({ t, error, onRetry }) {
        const code = typeof error?.code === 'string' ? error.code : 'unknown'
        const message = KNOWN_ERRORS.has(code) ? t(`error.${code}`) : t('error.unknown')
        return h(
          'div',
          { className: 'ocgo-error', role: 'alert' },
          h('h2', { className: 'ocgo-error-title' }, t('errorTitle')),
          h('p', { className: 'ocgo-error-text' }, message),
          typeof error?.message === 'string' && error.message !== message
            ? h('p', { className: 'ocgo-error-detail' }, error.message)
            : null,
          h('button', { type: 'button', className: 'ocgo-btn', onClick: onRetry }, t('retry'))
        )
      }

      function UsagePanel(props) {
        const t = typeof props?.t === 'function' ? props.t : boundT
        const [state, setState] = React.useState({ status: 'loading', data: null, error: null })
        const [nonce, setNonce] = React.useState(0)

        React.useEffect(() => {
          const controller = new AbortController()
          let live = true
          setState((previous) => ({
            status: previous.data ? 'refreshing' : 'loading',
            data: previous.data,
            error: null,
          }))
          callUsage(controller.signal).then(
            (value) => {
              if (live) setState({ status: 'ready', data: value, error: null })
            },
            (error) => {
              if (!live || error?.name === 'AbortError') return
              setState((previous) => ({ status: 'error', data: previous.data, error }))
            }
          )
          return () => {
            live = false
            controller.abort()
          }
        }, [nonce])

        const refresh = React.useCallback(() => setNonce((value) => value + 1), [])

        React.useEffect(() => {
          const timer = setInterval(refresh, REFRESH_MS)
          return () => clearInterval(timer)
        }, [refresh])

        const data = state.data
        const busy = state.status === 'loading' || state.status === 'refreshing'
        const limited = data?.go?.rolling?.limited === true
        const cards = data?.go
          ? [
              h(MeterCard, { key: 'rolling', t, title: t('rolling'), hint: t('rollingHint'), meter: data.go.rolling }),
              h(MeterCard, { key: 'weekly', t, title: t('weekly'), hint: t('weeklyHint'), meter: data.go.weekly }),
              h(MeterCard, { key: 'monthly', t, title: t('monthly'), hint: t('monthlyHint'), meter: data.go.monthly }),
            ]
          : [h(SkeletonCard, { key: 'a' }), h(SkeletonCard, { key: 'b' }), h(SkeletonCard, { key: 'c' })]

        const subtitle = data
          ? t('updated', { when: formatClock(data.fetchedAt) })
          : state.status === 'error'
            ? t('errorTitle')
            : t('loading')

        return h(
          'div',
          { className: 'ocgo-panel' },
          h('style', null, CSS),
          h(
            'div',
            { className: 'ocgo-inner' },
            h(
              'header',
              { className: 'ocgo-header' },
              h(
                'div',
                null,
                h('h1', { className: 'ocgo-title' }, t('title')),
                h('p', { className: 'ocgo-sub' }, subtitle)
              ),
              h(
                'div',
                { className: 'ocgo-actions' },
                limited ? h('span', { className: 'ocgo-badge', 'data-tone': 'error' }, t('limitedBadge')) : null,
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'ocgo-btn',
                    onClick: refresh,
                    disabled: busy,
                    'aria-busy': busy,
                  },
                  busy ? t('refreshing') : t('refresh')
                )
              )
            ),
            state.status === 'error' && data !== null
              ? h('p', { className: 'ocgo-stale', role: 'status' }, t('stale'))
              : null,
            state.status === 'error' && data === null
              ? h(ErrorState, { t, error: state.error, onRetry: refresh })
              : h('div', { className: 'ocgo-grid', 'aria-busy': busy }, cards),
            h(
              'footer',
              { className: 'ocgo-foot' },
              h(
                'span',
                null,
                data ? t('keySource', { source: t(`key.${data.keySource ?? 'dsh'}`) }) : t('loading')
              ),
              h(
                'a',
                {
                  className: 'ocgo-link',
                  href: CONSOLE_URL,
                  target: '_blank',
                  rel: 'noreferrer noopener',
                },
                t('openConsole')
              )
            )
          )
        )
      }

      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, UsagePanel)
      )
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 20,
            label: () => boundT('panel'),
            locale: NS,
          },
          UsageIcon
        )
      )
    }

    return { inject, apply }
  },
})
