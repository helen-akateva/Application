import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';

interface EventSnapshot {
  id: number;
  title: string;
  date: Date;
  location: string;
  tags: string[];
  role: 'organizer' | 'participant';
  participantsCount: number;
  participants: string[];
}

interface GroqResponse {
  choices: { message: { content: string } }[];
}

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private eventsService: EventsService,
  ) {}

  async ask(question: string, userId: number): Promise<string> {
    const userEvents = await this.eventsService.getUserEvents(userId);
    const today = new Date().toISOString();

    const snapshot: EventSnapshot[] = userEvents.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      location: e.location,
      tags: (e.tags ?? []).map((t) => t.name),
      role: e.organizer?.id === userId ? 'organizer' : 'participant',
      participantsCount: e.participantsCount ?? e.participants?.length ?? 0,
      participants: (e.participants ?? []).map((p) => p.name),
    }));

    const prompt = `You are a helpful assistant for an event management app.
Answer the user's question based ONLY on the provided events data. Be concise and friendly.
If the question is unclear or cannot be answered from the data, respond with exactly:
"Sorry, I didn't understand that. Please try rephrasing your question."

Today's date: ${today}

User's events:
${JSON.stringify(snapshot, null, 2)}

User question: ${question}`;

    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.3,
        }),
      },
    );

    const data = (await response.json()) as GroqResponse;
    return (
      data.choices?.[0]?.message?.content ??
      "Sorry, I didn't understand that. Please try rephrasing your question."
    );
  }
}
