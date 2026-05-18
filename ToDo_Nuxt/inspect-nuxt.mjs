import { loadNuxt } from 'nuxt'

const nuxt = await loadNuxt({ cwd: process.cwd(), dev: true })
console.log('pagesDir', nuxt.options.pagesDir)
console.log('pages', JSON.stringify(nuxt.options.pages, null, 2))
await nuxt.close()
