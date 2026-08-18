import { redirect } from 'next/navigation'

export default function AdvicePage() {
  redirect('/app/planner?tab=ai-suggestions')
}
