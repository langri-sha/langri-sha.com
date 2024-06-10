import { css } from '@emotion/react'
import styled from '@emotion/styled'

const icon = css`
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
`

export const Docker = styled((props: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={52}
    height={52}
    fill="none"
    viewBox="0 0 32 32"
    {...props}
  >
    <defs>
      <mask id="cutout">
        <rect width="100%" height="100%" fill="#fff" />
        <path
          fill="#000"
          d="M18 7h-2v2h2V7ZM10 10h2v2h-2v-2ZM6.002 16.941C6.172 19.843 7.9 24 14 24c6.8 0 9.833-5 10.5-7.5.833 0 2.7-.5 3.5-2.5-.5-.5-2.5-.5-3.5 0 0-.8-.5-2.5-1.5-3-.667.667-1.7 2.4-.5 4-.5 1-1.833 1-2.5 1H6.943c-.53 0-.973.413-.941.941ZM9 13H7v2h2v-2Z"
        />
        <path
          fill="#000"
          d="M10 13h2v2h-2v-2ZM15 13h-2v2h2v-2ZM16 13h2v2h-2v-2ZM21 13h-2v2h2v-2ZM15 10h-2v2h2v-2ZM16 10h2v2h-2v-2Z"
        />
      </mask>
    </defs>

    <circle cx={16} cy={16} r={14} mask="url(#cutout)" />
  </svg>
))`
  ${icon};
  transform: scale(1.15);
`

export const Github = styled(({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
  >
    <title>github</title>
    <path d="M16 0c-8.836 0-16 7.164-16 16 0 7.070 4.584 13.066 10.942 15.182 0.8 0.146 1.092-0.348 1.092-0.77 0-0.381-0.015-1.643-0.022-2.979-4.449 0.967-5.39-1.887-5.39-1.887-0.729-1.848-1.776-2.34-1.776-2.34-1.454-0.992 0.11-0.973 0.11-0.973 1.606 0.111 2.452 1.648 2.452 1.648 1.428 2.445 3.746 1.738 4.656 1.328 0.145-1.031 0.559-1.738 1.016-2.137-3.552-0.404-7.288-1.777-7.288-7.908 0-1.748 0.624-3.174 1.646-4.294-0.163-0.406-0.714-2.034 0.158-4.236 0 0 1.342-0.43 4.4 1.641 1.275-0.356 2.644-0.532 4.004-0.538 1.359 0.006 2.729 0.184 4.006 0.54 3.053-2.072 4.396-1.641 4.396-1.641 0.875 2.204 0.324 3.83 0.16 4.234 1.025 1.12 1.645 2.546 1.645 4.294 0 6.146-3.742 7.5-7.307 7.896 0.576 0.496 1.086 1.469 1.086 2.961 0 2.139-0.021 3.863-0.021 4.391 0 0.426 0.291 0.924 1.102 0.768 6.354-2.119 10.934-8.115 10.934-15.182 0-8.836-7.164-16-16-16z" />
  </svg>
))`
  ${icon};
`

export const Twitter = styled(({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
  >
    <title>twitter</title>
    <path d="M32 7.075c-1.175 0.525-2.444 0.875-3.769 1.031 1.356-0.813 2.394-2.1 2.887-3.631-1.269 0.75-2.675 1.3-4.169 1.594-1.2-1.275-2.906-2.069-4.794-2.069-3.625 0-6.563 2.938-6.563 6.563 0 0.512 0.056 1.012 0.169 1.494-5.456-0.275-10.294-2.888-13.531-6.862-0.563 0.969-0.887 2.1-0.887 3.3 0 2.275 1.156 4.287 2.919 5.463-1.075-0.031-2.087-0.331-2.975-0.819 0 0.025 0 0.056 0 0.081 0 3.181 2.263 5.838 5.269 6.437-0.55 0.15-1.131 0.231-1.731 0.231-0.425 0-0.831-0.044-1.237-0.119 0.838 2.606 3.263 4.506 6.131 4.563-2.25 1.762-5.075 2.813-8.156 2.813-0.531 0-1.050-0.031-1.569-0.094 2.913 1.869 6.362 2.95 10.069 2.95 12.075 0 18.681-10.006 18.681-18.681 0-0.287-0.006-0.569-0.019-0.85 1.281-0.919 2.394-2.075 3.275-3.394z" />
  </svg>
))`
  ${icon};
`

export const Npm = styled(({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
  >
    <title>npm</title>
    <path d="M0 0v32h32v-32h-32zM26 26h-4v-16h-6v16h-10v-20h20v20z" />
  </svg>
))`
  ${icon};
`

export const Keybase = styled(({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25 32"
  >
    <title>keybase</title>
    <path d="M10.286 27.429l1.714-8-1.714-2.286-2.286-1.143zM14.857 27.429l2.286-11.429-2.286 1.143-1.714 2.286zM17.714 9.393c-0.018-0.036-0.036-0.071-0.071-0.107-0.161-0.125-1.446-0.143-1.714-0.143-1.018 0-1.982 0.143-2.982 0.339-0.125 0.036-0.25 0.036-0.375 0.036s-0.25 0-0.375-0.036c-1-0.196-1.964-0.339-2.982-0.339-0.268 0-1.554 0.018-1.714 0.143-0.036 0.036-0.054 0.071-0.071 0.107 0.018 0.161 0.036 0.321 0.071 0.482 0.107 0.143 0.196 0.089 0.268 0.304 0.464 1.268 0.679 2.25 2.286 2.25 2.304 0 1.661-2.125 2.411-2.125h0.214c0.75 0 0.107 2.125 2.411 2.125 1.607 0 1.821-0.982 2.286-2.25 0.071-0.214 0.161-0.161 0.268-0.304 0.036-0.161 0.054-0.321 0.071-0.482zM25.143 25.089c0 2.911-1.911 4.625-4.768 4.625h-15.607c-2.857 0-4.768-1.714-4.768-4.625 0-3.232 0.571-8.125 3.893-9.732l-1.607-3.929h3.821c-0.25-0.732-0.393-1.5-0.393-2.286 0-0.196 0.018-0.393 0.036-0.571-0.696-0.143-3.464-0.714-3.464-1.714 0-1.054 3.036-1.625 3.75-1.768 0.375-1.339 1.268-3.375 2.179-4.429 0.357-0.411 0.804-0.661 1.357-0.661 1.071 0 1.929 1.107 3 1.107s1.929-1.107 3-1.107c0.554 0 1 0.25 1.357 0.661 0.911 1.054 1.804 3.089 2.179 4.429 0.714 0.143 3.75 0.714 3.75 1.768 0 1-2.768 1.571-3.464 1.714 0.089 0.964-0.036 1.929-0.357 2.857h3.821l-1.464 4.018c3.196 1.661 3.75 6.464 3.75 9.643z" />
  </svg>
))`
  ${icon};
  width: 0.7861328125em;
`

export const Stackoverflow = styled(({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 27 32"
  >
    <title>stackoverflow</title>
    <path d="M23.018 29.143h-19.964v-8.571h-2.857v11.429h25.679v-11.429h-2.857v8.571zM6.196 19.786l0.589-2.804 13.982 2.946-0.589 2.786zM8.036 13.107l1.196-2.607 12.946 6.054-1.196 2.589zM11.625 6.75l1.821-2.196 10.964 9.161-1.821 2.196zM18.714 0l8.518 11.446-2.286 1.714-8.518-11.446zM5.893 26.268v-2.839h14.286v2.839h-14.286z" />
  </svg>
))`
  ${icon};
  width: 0.857421875em;
`
