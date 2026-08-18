import { redirect } from 'next/navigation'

export default function PlannerClassicPage() {
  redirect('/app/planner?tab=classic')
}
