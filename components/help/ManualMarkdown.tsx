import React, { type ReactNode } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { headingId, manualHref } from '@/lib/manual/navigation'

function plainText(children: ReactNode): string {
  return React.Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child)
    if (React.isValidElement<{ children?: ReactNode }>(child)) return plainText(child.props.children)
    return ''
  }).join('')
}

export default function ManualMarkdown({ content }: { content: string }) {
  return <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
    h1: ({ children }) => <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">{children}</h1>,
    h2: ({ children }) => <h2 id={headingId(plainText(children))} className="mb-4 mt-10 scroll-mt-24 text-2xl font-semibold text-gray-900">{children}</h2>,
    h3: ({ children }) => <h3 id={headingId(plainText(children))} className="mb-3 mt-7 scroll-mt-24 text-xl font-semibold text-gray-900">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-2 mt-6 text-lg font-semibold text-gray-900">{children}</h4>,
    p: ({ children }) => <p className="my-4 leading-7 text-gray-700">{children}</p>,
    ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 text-gray-700">{children}</ul>,
    ol: ({ children, start }) => <ol start={start} className="my-4 list-decimal space-y-3 pl-6 text-gray-700">{children}</ol>,
    li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-gray-950">{children}</strong>,
    a: ({ href, children }) => {
      const target = manualHref(href ?? '')
      if (!target) return <span>{children}</span>
      const external = /^https?:\/\//.test(target)
      return <a href={target} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="rounded text-green-800 underline decoration-green-800/40 underline-offset-4 hover:decoration-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-800">{children}</a>
    },
    table: ({ children }) => <div className="my-6 overflow-x-auto rounded-lg border border-gray-300" role="region" aria-label="Tabella del manuale" tabIndex={0}><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
    th: ({ children }) => <th scope="col" className="border-b border-gray-300 bg-gray-100 p-3 font-semibold text-gray-900">{children}</th>,
    td: ({ children }) => <td className="border-b border-gray-200 p-3 align-top leading-6 text-gray-700">{children}</td>,
    blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-amber-500 bg-amber-50 px-5 py-1 text-amber-950">{children}</blockquote>,
    code: ({ children }) => <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-900">{children}</code>,
    pre: ({ children }) => <pre className="my-5 overflow-x-auto rounded-lg bg-gray-100 p-4">{children}</pre>,
    hr: () => <hr className="my-8 border-gray-200" />,
  }}>{content}</Markdown>
}
