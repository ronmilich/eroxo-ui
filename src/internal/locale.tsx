import { createContext, type ParentProps, useContext } from 'solid-js'

export interface LocaleMessages {
  readonly close: string
  readonly clear: string
  readonly loading: string
  readonly selectedCount: (count: number) => string
}

interface Locale {
  readonly locale?: string
  readonly dir?: 'ltr' | 'rtl' | 'auto'
  readonly messages: LocaleMessages
}

const LocaleContext = createContext<Locale>({
  messages: {
    close: 'Close',
    clear: 'Clear',
    loading: 'Loading',
    selectedCount: count => `${count} selected`,
  },
})

export function LocaleProvider(
  props: ParentProps<Omit<Locale, 'messages'> & { messages?: Partial<LocaleMessages> }>,
) {
  const parent = useLocale()
  const locale: Locale = {
    get locale() {
      return props.locale ?? parent.locale
    },
    get dir() {
      return props.dir ?? parent.dir
    },
    messages: {
      get close() {
        return props.messages?.close ?? parent.messages.close
      },
      get clear() {
        return props.messages?.clear ?? parent.messages.clear
      },
      get loading() {
        return props.messages?.loading ?? parent.messages.loading
      },
      get selectedCount() {
        return props.messages?.selectedCount ?? parent.messages.selectedCount
      },
    },
  }
  return (
    <LocaleContext value={locale}>
      <div lang={props.locale} dir={props.dir}>
        {props.children}
      </div>
    </LocaleContext>
  )
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}
