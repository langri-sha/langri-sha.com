export const slugify = (name) => (
  name.replace(' ', '-').toLowerCase()
)

export const iconify = (name) => (
  `icon-${slugify(name)}`
)
