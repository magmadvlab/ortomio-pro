import { redirect } from 'next/navigation'

export default function AlmanaccoPage() {
  redirect('/app/planner?tab=calendar')
}
