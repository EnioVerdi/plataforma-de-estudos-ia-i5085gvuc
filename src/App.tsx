import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppStoreProvider } from './stores/useAppStore'
import Layout from './components/Layout'
import Index from './pages/Index'
import Flashcards from './pages/Flashcards'
import Study from './pages/Study'
import Consultoria from './pages/Consultoria'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

const App = () => (
  <AppStoreProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/study/:subjectId" element={<Study />} />
            <Route path="/consultoria" element={<Consultoria />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppStoreProvider>
)

export default App
