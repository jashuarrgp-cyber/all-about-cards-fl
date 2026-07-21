import { redirect } from 'next/navigation';

export default function AppPage() {
  // The portfolio dashboard is the home of the mobile workspace.
  redirect('/app/portfolio');
}
