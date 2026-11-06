# VoiceMate AI — two-minute demo script

**Target length:** about 2 minutes. This script demonstrates the implemented speech path and clearly labels Evon as unavailable.

| Time | Screen/action | Suggested narration |
| --- | --- | --- |
| 0:00–0:12 | Show the VoiceMate dashboard and sidebar. | “Hi, this is VoiceMate AI, my voice-assistant dashboard for the Gnani AI Great Indian AI Internship Challenge.” |
| 0:12–0:27 | Show the empty state, microphone, text composer, and service status. | “The app brings voice capture, conversation history, settings, and service status into one responsive interface.” |
| 0:27–0:40 | Open Settings and show Connections. Keep `.env` and all credentials off screen. | “The browser talks to my Express backend. Gnani credentials stay on the server; the interface never receives the API key.” |
| 0:40–1:12 | Return to Assistant. Click the microphone, grant permission if asked, say: “Help me organize my notes for tomorrow,” then stop recording. Wait for the transcript. | “I’m recording a short message. The browser prepares a WAV clip, Prisma transcribes it, and VoiceMate displays the actual returned transcript with a Prisma label.” |
| 1:12–1:35 | Click **Listen** on the transcript and wait for playback. | “I can send that text to Timbre and play the synthesized audio. The control shows its preparing and playback state.” |
| 1:35–1:50 | Show the message composer or an Evon-unavailable error from a prior request, if useful. Do not present a fake assistant reply. | “Evon is not enabled yet. Chat requests return an explicit unavailable response while I confirm its official API contract.” |
| 1:50–2:00 | End on the dashboard or project title. | “That’s VoiceMate AI: a real Prisma and Timbre integration path, with the remaining LLM work clearly identified.” |

Before recording, run a live short-audio check and a Timbre playback check with your own authorized credentials. If either upstream call fails, show the truthful error state and do not imply a successful live call.
