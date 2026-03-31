import AppShell from '../components/layout/AppShell'
import Feed from '../components/feed/Feed'
import InstallPrompt from '../components/layout/InstallPrompt'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { currentUser } = useAuth()
  const name = currentUser?.displayName?.split(' ')[0]
  return (
    <AppShell title={name ? `Hey, ${name} 👋` : 'Textalk'} subtitle="What's happening">
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Feed />
      </div>
      <InstallPrompt />
    </AppShell>
  )
}
