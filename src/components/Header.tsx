import { BrainCircuit } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-beige-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo e nome */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-darkBlue-600 to-darkBlue-800 rounded-lg flex items-center justify-center shadow-md">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-darkBlue-700">FlashStudy</span>
            <span className="text-xs text-beige-500 font-medium">Mentoria</span>
          </div>
        </Link>

        {/* Placeholder para outros elementos do header */}
        <div className="flex items-center gap-4">
          {/* Adicione botões ou outras coisas aqui depois */}
        </div>
      </div>
    </header>
  )
}
