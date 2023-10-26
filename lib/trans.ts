import { useRouter } from "next/router"

import translations from './translations.json'

export default function trans(locale: string) {
    const _ = function(s: string, ...args: any[]) {
      let r = s
      const t = (translations as any)[s]
      if (t) r = t[locale as 'it'|'en'|'fu'] ?? s
      console.log(JSON.stringify({
        locale,
        s,
        t,
        r,
      }))
      args.forEach(arg => {
          const i = r.indexOf('%')
          if (i >= 0) {
              r = r.substring(0, i) + (arg) + r.substring(i+1)
          } else {
              r += ' ' + arg
          }
      })
      return r
    }
    _.locale = locale
    return _
  }
  
  export function useTrans() {
      const router = useRouter()
      const locale = router.locale || 'it'
      return trans(locale)
  }
  
  