# chatgpt.in

A high-fidelity, independent ChatGPT-inspired web application built for a hackathon from the provided UI reference screenshots.

## Current status

The production implementation is on `main` and the GitHub Actions production build is green.

### Product

- Responsive dark ChatGPT-style application shell
- Sidebar, chat history, search, rename and delete
- Conversation persistence in the browser
- OpenAI Responses API streaming
- Stop and regenerate responses
- Copy and share response actions
- Markdown and code rendering
- File upload through the OpenAI Files API and `input_file` model inputs
- Browser microphone recording and server-side transcription
- Model selector with persisted preference
- Settings and account surfaces
- Keyboard shortcuts and focus-visible accessibility states
- Mobile navigation drawer with backdrop and Escape handling
- Route loading and recovery states

### Reliability and security

- Request size/count validation on the chat endpoint
- Upload size validation
- API error handling and recoverable UI states
- Production `/api/health` endpoint with build metadata and no-store caching
- Browser security response headers
- Production Next.js build verified by GitHub Actions

## Release gate

1. Functional implementation — complete
2. Reliability and API hardening — complete
3. Mobile and responsive implementation — complete
4. Desktop/mobile fidelity layer — complete at code level
5. Production CI/build verification — green
6. Rendered-browser visual QA at the reference viewport sizes — requires a browser-rendering environment
7. Production smoke test against deployed API credentials/environment — requires the deployment environment

The repository is intentionally not claiming pixel-perfect rendered QA or live-provider smoke testing without those external environments.

This is an independent implementation for a hackathon and is not affiliated with or endorsed by OpenAI.
