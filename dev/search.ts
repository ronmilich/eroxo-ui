interface SearchPage {
  title: string
  route: string
  headings: string[]
  text: string
}

export function setupSearch() {
  const search = document.querySelector<HTMLElement>('[data-index]')
  const input = search?.querySelector<HTMLInputElement>('input')
  const results = search?.querySelector<HTMLElement>('.results')
  const status = results?.querySelector('p')
  const list = results?.querySelector('ul')
  const source = search?.dataset.index
  if (!search || !input || !results || !list || !status || !source) return

  search.hidden = false
  const url = new URL(source, window.location.href)
  let index: Promise<SearchPage[]> | undefined

  input.addEventListener('input', async () => {
    const query = input.value.trim().toLowerCase()
    results.hidden = !query
    list.replaceChildren()
    if (!query) return
    status.textContent = 'Searching…'

    try {
      index ??= fetch(url).then(response => {
        if (!response.ok) throw new Error('Failed to load search index')
        return response.json() as Promise<SearchPage[]>
      })
      const pages = await index
      if (query !== input.value.trim().toLowerCase() || results.hidden) return
      const words = query.split(/\s+/)
      const matches = pages.filter(page => {
        const text = [page.title, ...page.headings, page.text].join(' ').toLowerCase()
        return words.every(word => text.includes(word))
      })
      matches.sort(
        (left, right) =>
          Number(right.title.toLowerCase().includes(query)) -
          Number(left.title.toLowerCase().includes(query)),
      )
      status.textContent = matches.length === 0 ? 'No results' : ''
      const links = matches.map(page => {
        const item = document.createElement('li')
        const link = document.createElement('a')
        link.href = new URL(page.route, url).href
        link.textContent = page.title
        item.append(link)
        return item
      })
      list.replaceChildren(...links)
    } catch {
      index = undefined
      if (query === input.value.trim().toLowerCase()) status.textContent = 'Search is unavailable'
    }
  })

  search.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || results.hidden) return
    results.hidden = true
    input.focus()
  })
}
