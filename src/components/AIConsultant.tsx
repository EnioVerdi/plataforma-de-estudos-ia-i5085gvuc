import { useState } from 'react'
import OpenAI from 'openai'

export function AIConsultant() {
  const [subject, setSubject] = useState('')
  const [context, setContext] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const handleConsult = async () => {
    if (!subject.trim()) {
      setError('Por favor, digite uma matéria')
      return
    }

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const message = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um consultor de estudos especializado em preparação para vestibular UFPR. 
Ajude o aluno criando cronogramas, explicando conceitos difíceis e otimizando tempo de estudo.
Seja claro, objetivo e prático nas respostas.`
          },
          {
            role: 'user',
            content: `Matéria: ${subject}\n${context ? `Detalhes: ${context}` : 'Por favor, crie um cronograma de estudo para esta matéria.'}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const aiResponse = message.choices[0].message.content || 'Sem resposta'
      setResponse(aiResponse)
    } catch (err) {
      console.error('Erro ao consultar IA:', err)
      setError('Erro ao conectar com a IA. Verifique sua chave de API.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && subject.trim()) {
      handleConsult()
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📚 Consultor de Estudos IA</h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Ex: Qual matéria você quer estudar? (História, Matemática, etc)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500"
      />

      <textarea
        placeholder="Ex: Preciso de cronograma para estudar Revolução Francesa em 2 semanas..."
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded mb-4 h-24 focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={handleConsult}
        disabled={loading || !subject.trim()}
        className="w-full bg-blue-500 text-white px-4 py-3 rounded font-bold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {loading ? '⏳ Consultando IA...' : '🚀 Consultar IA'}
      </button>

      {response && (
        <div className="mt-6 p-4 bg-gray-100 rounded border-l-4 border-blue-500">
          <h3 className="font-bold mb-3 text-gray-800">✨ Resposta da IA:</h3>
          <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{response}</p>
        </div>
      )}
    </div>
  )
}
