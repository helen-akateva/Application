import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventsService } from '../events/events.service';

interface EventSnapshot {
  id: number;
  title: string;
  date: string;
  _sortDate: number;
  dayOfWeek: string;
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

    const userEventIds = new Set(userEvents.map((e) => e.id));

    const publicOnlyEvents = allPublicEvents.filter(
      (e) => !userEventIds.has(e.id),
    );

    const now = new Date();
    const today = now.toLocaleString('en-US', {
      timeZone: 'Europe/Kiev',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const formatDate = (date: Date) =>
      new Date(date).toLocaleString('en-US', {
        timeZone: 'Europe/Kiev',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    const snapshot: EventSnapshot[] = [
      ...userEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: formatDate(e.date),
        _sortDate: new Date(e.date).getTime(),
        dayOfWeek: new Date(e.date).toLocaleDateString('en-US', {
          timeZone: 'Europe/Kiev',
          weekday: 'long',
        }),
        location: e.location,
        tags: (e.tags ?? []).map((t) => t.name),
        role:
          e.organizer?.id === userId
            ? ('organizer' as const)
            : ('participant' as const),
        participantsCount: e.participantsCount ?? e.participants?.length ?? 0,
        participants: (e.participants ?? []).map((p) => p.name),
        isPublic: e.visibility === 'public',
      })),
      ...publicOnlyEvents.map((e) => ({
        id: e.id,
        title: e.title,
        date: formatDate(e.date),
        _sortDate: new Date(e.date).getTime(),
        dayOfWeek: new Date(e.date).toLocaleDateString('en-US', {
          timeZone: 'Europe/Kiev',
          weekday: 'long',
        }),
        location: e.location,
        tags: (e.tags ?? []).map((t) => t.name),
        role: 'none' as const,
        participantsCount: e.participantsCount ?? 0,
        participants: (e.participants ?? []).map((p) => p.name),
        isPublic: true,
      })),
    ].sort((a, b) => a._sortDate - b._sortDate);

    const prompt = `You are a professional AI Assistant for an Event Management System.
Your goal is to help users explore their events and discover new ones.

Strict Compliance with Technical Specification:
- READ-ONLY: You CANNOT create, edit, delete, or join/leave events/tags. 
- SPECIFIC FALLBACKS (UX Improvement):
  1. If the user asks to modify data (create, delete, edit, join, leave), respond: "I am a read-only assistant and cannot perform actions like creating or deleting data."
  2. If the user asks about something completely unrelated to events or the app (e.g., general knowledge), respond: "I'm sorry, but I can only answer questions related to your events and the event management system."
  3. If the question is unclear, garbled, or unsupported, respond: "Sorry, I didn't understand that. Please try rephrasing your question."
- "Your events": Events where your role is "organizer" or "participant".

Interaction Rules:
1. BE CONCISE AND FRIENDLY.
2. If no events match a query, say: "I couldn't find any events matching your request."
3. "Next event" means the chronologically closest UPCOMING event (_sortDate > now) where role is "organizer" OR "participant". The snapshot is already sorted by _sortDate ascending — pick the first event with role "organizer" or "participant" that has a future date.
4. "This week" is strictly Monday to Sunday of the current week.
5. "This weekend" is strictly Saturday and Sunday of the current week.
6. Format dates as "Monday, April 20, 2026 at 2:00 PM".

Today is: ${today}

Events Snapshot (sorted by date ascending):
${JSON.stringify(snapshot, null, 2)}

User question: ${question}
`;

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
