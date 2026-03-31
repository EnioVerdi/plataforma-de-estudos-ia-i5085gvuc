import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // ⚠️ Apenas para desenvolvimento
})

export const aiService = {
  async consultStudy(subject: string, context: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Você é um consultor de estudos especializado em preparação para vestibular UFPR. 
          Ajude o aluno a criar cronogramas, entender conceitos e otimizar seu tempo de estudo.`
        },
        {
          role: 'user',
          content: `Matéria: ${subject}\nContexto: ${context}`
        }
      ],
      temperature: 0.7
    })

    return response.choices[0].message.content || ''
  }
}
