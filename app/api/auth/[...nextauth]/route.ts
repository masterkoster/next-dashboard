import { handlers, auth } from "@/lib/auth"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Pass secret to handlers
export const GET = handlers.GET
export const POST = handlers.POST
export { auth }
