'use client'

import { Global } from '@emotion/react'
import * as React from 'react'

import { Scene } from '@/components/scene'
import { global } from '@/styles'

export const ShapePreview: React.FC = () => (
  <React.Fragment>
    <Global styles={global} />
    <Scene starOnly />
  </React.Fragment>
)
