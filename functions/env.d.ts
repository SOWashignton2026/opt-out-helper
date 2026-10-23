// Pages wrangler config cannot declare `secrets`. Production sets this with
// `wrangler pages secret put GROQ_API_KEY --project-name privacy`.
interface Env {
  GROQ_API_KEY: string;
}
