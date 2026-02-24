import { redirect } from 'next/navigation'

export default function ManageIndexPage() {
  redirect('/modules/flying-club/manage/awaiting-dispatch')
}
