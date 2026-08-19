import { redirect } from 'next/navigation'

export default function SemenzaioPage() {
  redirect('/app/plants?tab=seedlings')
}
