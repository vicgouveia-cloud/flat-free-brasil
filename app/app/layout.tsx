import AppNav from '@/components/AppNav'
import DemoBanner from '@/components/DemoBanner'

export const metadata = {
  title: 'Plataforma Flat Free - Modo Demonstração',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBanner />
      <div className="app-layout">
        <AppNav />
        <main className="app-main">{children}</main>
      </div>
    </>
  )
}
