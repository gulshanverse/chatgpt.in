# chatgpt.in

A high-fidelity, independent ChatGPT-inspired web application built for a hackathon from the provided UI reference screenshots.

## Current status

The primary functional shell is implemented on `feat/primary-shell-integration`.

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
- `/api/health` endpoint
- Browser security response headers
- Production Next.js build verified by GitHub Actions

## Final roadmap

1. Final mobile interaction polish
2. Pixel-level visual refinement against the supplied reference screenshots
3. Rendered-browser visual QA at reference viewport sizes
4. Production environment and API failure verification
5. Final CI and pull-request review
6. Merge and deployment

This is an independent implementation for a hackathon and is not affiliated with or endorsed by OpenAI.
