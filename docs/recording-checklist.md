# Demo recording checklist

## Before recording

- [ ] Start the app from this project directory with `npm run dev`.
- [ ] Confirm `http://localhost:4000/api/health` responds and note that health flags show key presence, not successful upstream authorization.
- [ ] Confirm Vite is serving this workspace at `http://localhost:5173`.
- [ ] Test a short microphone recording and verify the returned Prisma transcript appears in the conversation.
- [ ] Test Timbre playback and verify audible output, not only a successful HTTP response.
- [ ] Keep the recording under 30 seconds and use a quiet environment.
- [ ] Grant browser microphone permission before starting the capture.
- [ ] Close unrelated tabs, especially any containing credentials or personal data.
- [ ] Check that `server/.env`, API keys, tokens, and private account details are not visible in the recording.
- [ ] Have the two-minute script nearby; leave time for upstream latency.

## During recording

- [ ] Capture the empty dashboard, service status, microphone flow, visible transcript, and Timbre playback action.
- [ ] Wait for the actual transcript and audio to finish before narrating success.
- [ ] Show loading/error states honestly if a service is unavailable.
- [ ] Do not imply Evon chat works; it is currently disabled.
- [ ] Avoid showing terminal output that contains environment values.

## After recording

- [ ] Review the full video for secrets, unexpected personal information, and misleading claims.
- [ ] Confirm the transcript and playback are legible/audible.
- [ ] Export in a common MP4 format at 1080p where possible.
- [ ] Save the approved video outside the source tree or in an intentional `docs/media/` location.
- [ ] Capture separate, secret-free screenshots for the repository README.
