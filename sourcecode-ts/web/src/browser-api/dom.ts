export const setPageTitle = (title: string) => {
  document.title = title
}

export const setPageIcon = (href: string) => {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = href
}
