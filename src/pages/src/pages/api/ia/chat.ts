import { NextApiRequest, NextApiResponse } from 'next';
import openai from '@/lib/ia';
import { CONSULTORIA_SYSTEM_PROMPT } from '@/lib/prompts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Mensagem ausente' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: CONSULTORIA_SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    res.status(200).json({ response: aiResponse });
  } catch (error: any) {
    console.error('Erro ao processar:', error);
    res.status(500).json({ message: 'Erro ao processar requisição' });
  }
}