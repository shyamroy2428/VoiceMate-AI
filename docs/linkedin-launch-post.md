# LinkedIn launch post draft

I’m sharing **VoiceMate AI**, a voice-assistant dashboard I built for the Gnani AI Great Indian AI Internship Challenge.

The project connects a responsive React interface to a Node/Express backend, with integration paths for:

- **Gnani Prisma** for speech-to-text
- **Gnani Timbre** for text-to-speech playback

Microphone recordings are prepared as short WAV clips, and the transcript is shown in the conversation. Text can be sent to Timbre for audio playback. API credentials stay on the backend.

I’ve kept one limitation explicit: **Evon is not enabled yet**. I’m waiting to confirm its official API contract rather than showing a pretend response. The current integration tests use mocked upstream responses; live API behavior depends on the configured key and service access.

This project helped me practice voice UX, API boundaries, error handling, and honest integration status. I’m continuing to refine the experience and validate the live speech flow.

#GnaniAI #VoiceAI #React #NodeJS #AIInternship #BuildInPublic

Before posting, replace or remove any statement that does not match the live demo you personally verified. Attach an approved screenshot or demo clip only after checking it contains no credentials or private data.
