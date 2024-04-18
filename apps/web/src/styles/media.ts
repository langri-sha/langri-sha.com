export const [small, medium, large] = [0, 34, 75].map(
  (breakpoint) => `@media (min-width: ${breakpoint}em)`,
)
