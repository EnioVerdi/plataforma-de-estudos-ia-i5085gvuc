import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppStoreProvider } from './stores/useAppStore'
import { AuthProvider, useAuth } from './hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import Flashcards from './pages/Flashcards'
import Study from './pages/Study'
import Consultoria from './pages/Consultoria'
import Settings from './pages/Settings'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import FlashcardsChat from './pages/FlashcardsChat'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/auth/register" />
  return <>{children}</>
}

const App = () => (
  <AuthProvider>
    <AppStoreProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth/register" element={<Register />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Index />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/study/:subjectId" element={<Study />} />
              <Route path="/consultoria" element={<Consultoria />} />
              <Route path="/flashcards-chat" element={<FlashcardsChat />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AppStoreProvider>
  </AuthProvider>
)

export default App
