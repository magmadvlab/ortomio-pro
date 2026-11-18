import ManualIndex from '@/components/help/ManualIndex'
import { getManualChapters } from '@/lib/manual/content'

export default function HelpPage() {
  return <ManualIndex chapters={getManualChapters()} />
}
