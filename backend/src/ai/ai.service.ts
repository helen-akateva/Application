import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';

interface EventSnapshot {
  id: number;
  title: string;
  date: Date;
  location: string;
  tags: string[];
  role: 'organizer' | 'participant' | 'none';
  participantsCount: number;
  participants: string[];
  isPublic: boolean;
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
    const [userEvents, allPublicEvents] = await Promise.all([
      this.eventsService.getUserEvents(userId),
      this.eventsService.findAll(),
    ]);

    // User event IDs to avoid duplication
    const userEventIds = new Set(userEvents.map((e) => e.id));

    // Public events the user is not participating in
    const publicOnlyEvents = allPublicEvents.filter(
      (e) => !userEventIds.has(e.id),
    );

    const today = new Date().toISOString();

    const snapshot: EventSnapshot[] = [
      // Personal user events
      ...userEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        tags: (e.tags ?? []).map((t) => t.name),
        role:
          e.organizer?.id === userId
            ? ('organizer' as const)
            : ('participant' as const),
        participantsCount: e.participantsCount ?? e.participants?.length ?? 0,
        participants: (e.participants ?? []).map((p) => p.name),
        isPublic: true,
      })),
      // Public events where user does not participate
      ...publicOnlyEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        tags: (e.tags ?? []).map((t) => t.name),
        role: 'none' as const,
        participantsCount: e.participantsCount ?? 0,
        participants: (e.participants ?? []).map((p) => p.name),
        isPublic: true,
      })),
    ];

    const prompt = `You are a helpful assistant for an event management app.
Answer the user's question based ONLY on the provided events data. Be concise and friendly.
You have READ-ONLY access. You CANNOT create, modify, delete, or join events or tags.

IMPORTANT RULES:
1. If the user asks you to perform ANY data modification action (create, update, delete, join), OR if they ask about something completely unrelated to the app (like geography or politics), you MUST respond with EXACTLY this phrase:
"Sorry, I didn't understand that. Please try rephrasing your question."
2. If the user asks a valid question about events (e.g., filtering by date, tag, or role), but there are NO matching events in the data, DO NOT use the fallback phrase. Instead, calmly inform them that there are no events matching their request.
3. Always format dates in a human-readable format like "April 20, 2026 at 6:00 PM". NEVER use ISO format like "2026-04-20T18:00:00.000Z".

Today's date: ${today}

Events data includes:
- User's personal events (role: "organizer" or "participant")
- Public events available to join (role: "none")

Events:
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
