import { NextResponse } from "next/server"
import OpenAI from "openai"
import { SpeechClient } from "@google-cloud/speech"

export async function POST(req: Request) {
  const googleCredentialsJson = process.env.GOOGLE_SPEECH_CREDENTIALS_JSON
  const googleCredentialsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const hasGoogle = Boolean(googleCredentialsJson || googleCredentialsFile)
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY)
  const googleCompatibleTypes = ["audio/webm", "audio/ogg"]

  if (!hasGoogle && !hasOpenAI) {
    return NextResponse.json(
      { error: "Configure GOOGLE_SPEECH_CREDENTIALS_JSON ou OPENAI_API_KEY." },
      { status: 500 }
    )
  }

  const form = await req.formData()
  const file = form.get("file")

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo de áudio obrigatório" }, { status: 400 })
  }

  try {
    const contentType = (file.type || "").toLowerCase()
    const isGoogleCompatible = googleCompatibleTypes.some((type) => contentType.startsWith(type))

    if (hasGoogle && isGoogleCompatible) {
      const credentials = googleCredentialsJson ? JSON.parse(googleCredentialsJson) : undefined
      const client = new SpeechClient(
        credentials
          ? { credentials, projectId: credentials.project_id }
          : { keyFilename: googleCredentialsFile }
      )

      const audioBuffer = Buffer.from(await file.arrayBuffer())
      const [response] = await client.recognize({
        config: {
          encoding: "WEBM_OPUS",
          languageCode: process.env.GOOGLE_SPEECH_LANGUAGE || "pt-BR",
          enableAutomaticPunctuation: true,
        },
        audio: { content: audioBuffer.toString("base64") },
      })

      const transcript = (response.results || [])
        .map((result) => result.alternatives?.[0]?.transcript || "")
        .filter(Boolean)
        .join("\n")

      return NextResponse.json({ transcript })
    }

    if (hasOpenAI) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: "gpt-4o-mini-transcribe",
      })

      return NextResponse.json({ transcript: transcription.text })
    }

    return NextResponse.json(
      { error: "Formato de áudio não suportado para transcrição." },
      { status: 415 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao transcrever áudio"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
