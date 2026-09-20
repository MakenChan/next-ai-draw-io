import "server-only"

import { getAIModel } from "@/lib/ai-providers"
import { findServerModelById } from "@/lib/server-model-config"

export async function getAIModelFromRequest(req: Request) {
    const provider = req.headers.get("x-ai-provider")
    let baseUrl = req.headers.get("x-ai-base-url")
    const selectedModelId = req.headers.get("x-selected-model-id")

    if (provider === "edgeone" && !baseUrl) {
        const origin = req.headers.get("origin") || new URL(req.url).origin
        baseUrl = `${origin}/api/edgeai`
    }

    let serverModelConfig: {
        apiKeyEnv?: string | string[]
        baseUrlEnv?: string
        provider?: string
    } = {}

    if (selectedModelId?.startsWith("server:")) {
        const serverModel = await findServerModelById(selectedModelId)
        if (serverModel) {
            serverModelConfig = {
                apiKeyEnv: serverModel.apiKeyEnv,
                baseUrlEnv: serverModel.baseUrlEnv,
                provider: serverModel.provider,
            }
        }
    }

    const cookieHeader = req.headers.get("cookie")

    return getAIModel({
        provider: serverModelConfig.provider || provider,
        baseUrl,
        apiKey: req.headers.get("x-ai-api-key"),
        modelId: req.headers.get("x-ai-model"),
        awsAccessKeyId: req.headers.get("x-aws-access-key-id"),
        awsSecretAccessKey: req.headers.get("x-aws-secret-access-key"),
        awsRegion: req.headers.get("x-aws-region"),
        awsSessionToken: req.headers.get("x-aws-session-token"),
        vertexApiKey: req.headers.get("x-vertex-api-key"),
        ...serverModelConfig,
        ...(provider === "edgeone" &&
            cookieHeader && {
                headers: { cookie: cookieHeader },
            }),
    })
}
