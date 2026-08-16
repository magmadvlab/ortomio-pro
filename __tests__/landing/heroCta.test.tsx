import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import reactDomServer from 'react-dom/server'

const { renderToStaticMarkup } = reactDomServer

test('the hero CTA leads to the guided-trial section', async (context) => {
  context.mock.module('next/image', {
    exports: {
      default: ({ fill: _fill, priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & {
        fill?: boolean
        priority?: boolean
      }) => <img {...props} />,
    },
  })

  const [{ default: Hero }, { default: FinalCta }] = await Promise.all([
    import('../../components/landing/sections/Hero'),
    import('../../components/landing/sections/FinalCta'),
  ])
  const heroMarkup = renderToStaticMarkup(<Hero />)
  const finalCtaMarkup = renderToStaticMarkup(<FinalCta />)

  assert.match(heroMarkup, /href="#prova-guidata"/)
  assert.match(finalCtaMarkup, /id="prova-guidata"/)
})
