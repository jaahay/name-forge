# Pronunciation provider evaluation

Snapshot date: 2026-10-02

Related decision: [`decisions/0009-generated-pronunciation-authority.md`](decisions/0009-generated-pronunciation-authority.md)

## Purpose

This is a dated provider survey for issue #222. It is not a vendor commitment.

Name Forge should evaluate TTS providers only after defining its own pronunciation contract. The relevant question is not which voice sounds most natural from ordinary spelling. The relevant question is whether a provider can render Name Forge's structured pronunciation intent without silently re-deciding invented-name pronunciation.

Provider capabilities, prices, quotas, model names, and retention terms change faster than the architecture. Recheck them before implementation.

## Required gate

For authoritative pronunciation audio, a selected provider model/voice must support:

- explicit phoneme or equivalent pronunciation control for invented names;
- the stress distinctions Name Forge chooses to preserve;
- a deterministic and inspectable rendering payload;
- phrase pacing or a composition strategy that does not alter component pronunciation;
- a failure path when a sound cannot be represented faithfully;
- acceptable latency, quota, privacy/retention, licensing, and cost characteristics.

Text-only or prompt-only TTS may still be useful as a voice draft, but it does not pass the pronunciation-authority gate.

## Current survey

| Provider | Explicit pronunciation control | Fit for unique generated names | Operational notes | Current conclusion |
| --- | --- | --- | --- | --- |
| Microsoft Azure Speech | SSML `phoneme` plus custom lexicons; documentation supports IPA and Microsoft SAPI phonetic alphabets. | Strong. Inline phoneme markup avoids maintaining a durable dictionary for every generated name. | SSML also supports pacing/prosody controls. Microsoft states real-time TTS text and generated audio are not retained by the service. Pricing is usage-based by synthesized characters and varies by selected offering/region. | **Candidate for an authoritative renderer spike** once Name Forge has a valid phonetic projection. |
| Google Cloud Text-to-Speech | SSML `phoneme` supports IPA and X-SAMPA; custom pronunciations can also be supplied in the synthesis request. The documentation explicitly describes primary/secondary stress and optional syllable boundaries. | Strong. Inline/request-scoped pronunciation is a good match for one-off invented names. | Google states Cloud TTS does not log customer text or audio. Pricing depends on voice/model family; current published examples range from character-priced legacy/neural/Chirp offerings to token-priced Gemini TTS. Phoneme support must be confirmed for the exact chosen voice/model. | **Candidate for an authoritative renderer spike**. Particularly attractive for testing stress and syllable projection. |
| Amazon Polly | SSML `phoneme` supports IPA and X-SAMPA, and PLS lexicons are available. Current phoneme documentation explicitly lists standard, neural, and long-form engines; generative voices should not be assumed to support the same tag without model-specific verification. | Strong on models that support inline `phoneme`; persistent lexicons are optional rather than required. | AWS states Polly does not retain text submissions and allows generated audio to be cached/replayed. Current published pricing is per million characters and varies by engine (for example Standard, Neural, and Generative). | **Viable authoritative renderer**, but model/SSML compatibility is a hard gate; do not choose a newer voice engine solely for naturalness. |
| ElevenLabs | Pronunciation dictionaries support phoneme rules using IPA or CMU on supported models; unsupported models fall back to aliases/default pronunciation. Current docs say non-English IPA/CMU pronunciation requires a supported multilingual model. | Moderate-to-strong. Pronunciation control exists, but dictionary/version lifecycle is less naturally request-local than inline SSML for a stream of unique invented names. | Streaming and low-latency models are available. Current API pricing is character-based and varies by model. Zero Retention Mode is an enterprise feature; default usage retains generation history subject to their controls. | **Worth a renderer spike if voice quality justifies dictionary management**, but not the simplest first integration for ephemeral names. |
| OpenAI Text-to-Speech API | Current TTS documentation exposes instruction-level control over delivery such as accent, intonation, speed, and tone. The current guide does not document an SSML or phoneme-input contract. | Weak for authoritative pronunciation today. Prompting may improve an invented-name reading, but it leaves the model responsible for interpreting the pronunciation. | The API is token-metered and supports streaming/audio output. OpenAI states API data is not used for training by default; `/v1/audio/speech` is eligible for Zero Data Retention, with default abuse-monitoring retention otherwise applying. | **Voice-draft candidate only for this use case unless an explicit pronunciation-control contract is documented later.** |

## Sources

### Microsoft Azure Speech

- [Pronunciation with SSML](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-pronunciation)
- [SSML overview](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup)
- [Text-to-speech data, privacy, and security](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/text-to-speech/data-privacy-security)
- [Azure Speech product/pricing overview](https://azure.microsoft.com/en-us/products/ai-foundry/tools/speech)

### Google Cloud Text-to-Speech

- [SSML reference](https://cloud.google.com/text-to-speech/docs/ssml)
- [Supported phonemes and stress](https://cloud.google.com/text-to-speech/docs/phonemes)
- [Pricing](https://cloud.google.com/text-to-speech/pricing)
- [Data logging](https://cloud.google.com/text-to-speech/docs/data-logging)
- [Quotas and limits](https://cloud.google.com/text-to-speech/quotas)

### Amazon Polly

- [Using phonetic pronunciation](https://docs.aws.amazon.com/polly/latest/dg/phoneme-tag.html)
- [SSML](https://docs.aws.amazon.com/polly/latest/dg/ssml.html)
- [Managing lexicons](https://docs.aws.amazon.com/polly/latest/dg/managing-lexicons.html)
- [Pricing](https://aws.amazon.com/polly/pricing/)
- [Security best practices](https://docs.aws.amazon.com/polly/latest/dg/security-best-practices.html)

### ElevenLabs

- [Pronunciation dictionaries](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries)
- [API pricing](https://elevenlabs.io/pricing/api)
- [Zero Retention Mode](https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode)

### OpenAI

- [Text-to-speech guide](https://developers.openai.com/api/docs/guides/text-to-speech)
- [API data controls](https://developers.openai.com/api/docs/guides/your-data)

## Recommendation

Do not select a production provider in #222.

After generation owns the pronunciation facts and Name Forge has an audited provider-neutral phonetic projection, run a small renderer spike against **Azure Speech and Google Cloud Text-to-Speech first** because both currently document request-local phoneme control that maps well to short, unique invented names. Include **Amazon Polly** if the selected neural/standard voice supports the required phoneme inventory and desired quality. Include **ElevenLabs** when testing whether its voice quality outweighs pronunciation-dictionary lifecycle overhead.

Treat **OpenAI TTS** as a voice-draft option under the current documented interface, not as the authoritative pronunciation renderer.

The spike should use a fixed corpus of generated segment sequences covering every current sound segment, multiple syllable counts, stress positions, and composed-name boundaries. Evaluate faithfulness to the requested phonemes and stress before naturalness.

At Name Forge's short-utterance scale, provider cost is unlikely to be the first architectural discriminator. Pronunciation controllability, provider/model coverage, failure behavior, and retention terms should be decided first; current prices should be refreshed at implementation time.
