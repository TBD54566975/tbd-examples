import { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = string
declare module "../../../../../node_modules/.pnpm/nuxt@3.10.3_@types+node@18.16.19_rollup@2.61.1_sass@1.63.6_typescript@5.3.3_vite@5.1.4_xml2js@0.6.2/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}