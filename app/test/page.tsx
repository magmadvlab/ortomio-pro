import { notFound } from 'next/navigation'

export default function TestPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>🌱 Test Page - Funziona!</h1>
      <p>Se vedi questa pagina, il server Next.js funziona correttamente.</p>
      <p>Il problema è nel layout della dashboard.</p>
    </div>
  )
}
