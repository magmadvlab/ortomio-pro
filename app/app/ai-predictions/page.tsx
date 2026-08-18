import { redirect } from 'next/navigation'

export default function AIPredictionsPage() {
  redirect('/app/farm?tab=predictions')
}
