const media = (breakpoint: number) => `@media (min-width: ${breakpoint}em)`

export const small: string = media(0)
export const medium: string = media(34)
export const large: string = media(75)
