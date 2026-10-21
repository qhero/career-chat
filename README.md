# career-chat

AI chat that answers recruiters' questions about my professional career.
Approach: **CAG** (cache-augmented generation): the whole resume (`api/profile.md`) is the system prompt,
marked for prompt caching. No vector DB, no retrieval.

- `api/` ASP.NET Core minimal API: validates input, rate-limits, streams Claude's SSE response.
- `web/` Angular chat UI (signals, `fetch` stream reader).

## Run
1. Fill in `api/profile.md`.
2. API (port 5000):
   ```bash
   cd api
   dotnet user-secrets set "Anthropic:Key" "sk-ant-..."
   dotnet run --urls http://localhost:5000
   ```
3. Web:
   ```bash
   cd web
   npm install
   npm start        # http://localhost:4200, proxies /chat to the API
   ```

## Check the cache works
Send two messages within 5 minutes. In the SSE `message_start` event, `usage.cache_read_input_tokens`
should be > 0 on the second one. If it stays 0, the profile is below the model's minimum cacheable size.

## Skipped on purpose
Database, auth, saved conversations, SDK, vector DB. Add when needed (see plan).
