import Groq from 'groq-sdk'
//import OpenAI from 'openai'
import type { Request, Response } from 'express'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export const getRecommendation = async (req: Request, res: Response) => {
    try {
        const { movie1, movie2, mood } = req.body as unknown as { movie1: any, movie2: any, mood: string}

        const prompt = `Imam dva filma:
        Film 1: ${movie1.title} - ${movie1.overview}
        Film 2: ${movie2.title} - ${movie2.overview}
        Korisnikovo raspoloženje: ${mood}
        Koji film mi preporučuješ da gledam i zašto? Odgovori malo detaljnije i navedi radnju filma i zasto bi bio dobar 
        da se gleda i odgovori na srpskom.`

        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: prompt }]
        })

      const text = completion.choices[0]?.message?.content ?? 'Unable to generate a recommendation'

        return res.status(200).json({ recommendation: text })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ 
            message: 'Error',
            timestamp: new Date().toISOString()
        })
    }
}