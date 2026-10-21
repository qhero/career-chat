import { Component, signal } from '@angular/core';

type Msg = { role: 'user' | 'assistant'; content: string };

@Component({ selector: 'app-root', templateUrl: './app.html', styleUrl: './app.css' })
export class App {
  msgs = signal<Msg[]>([]);
  busy = signal(false);
  suggestions = ['What is his main tech stack?', 'What was his latest project?', 'Is he available for new roles?'];

  async send(text: string) {
    text = text.trim();
    if (!text || this.busy()) return;
    const history: Msg[] = [...this.msgs(), { role: 'user', content: text }];
    this.msgs.set([...history, { role: 'assistant', content: '' }]);
    this.busy.set(true);
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        const lines = buf.split('\n');
        buf = lines.pop()!;
        for (const l of lines) {
          if (!l.startsWith('data: ')) continue;
          const t = JSON.parse(l.slice(6)).delta?.text; // content_block_delta events only
          if (t) this.append(t);
        }
      }
    } catch {
      this.append('Sorry, something went wrong. Please try again in a moment.');
    } finally {
      this.busy.set(false);
    }
  }

  private append(t: string) {
    this.msgs.update(m => [...m.slice(0, -1), { ...m.at(-1)!, content: m.at(-1)!.content + t }]);
  }
}
