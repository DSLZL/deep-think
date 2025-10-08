import { useSettingStore } from "@/store/setting";
import {
  createAIProvider,
  type AIProviderOptions,
} from "@/utils/deep-research/provider";
import {
  GEMINI_BASE_URL,
  OPENROUTER_BASE_URL,
  OPENAI_BASE_URL,
  ANTHROPIC_BASE_URL,
  DEEPSEEK_BASE_URL,
  XAI_BASE_URL,
  MISTRAL_BASE_URL,
  OLLAMA_BASE_URL,
  POLLINATIONS_BASE_URL,
} from "@/constants/urls";
import { multiApiKeyPolling } from "@/utils/model";
import { generateSignature } from "@/utils/signature";
import { completePath } from "@/utils/url";

function useModelProvider() {
  async function createModelProvider(model: string, settings?: any) {
    const { mode, provider, accessPassword } = useSettingStore.getState();
    const options: AIProviderOptions = {
      baseURL: "",
      provider,
      model,
      settings,
    };

    switch (provider) {
      case "google":
        const { apiKey = "", apiProxy } = useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(
            apiProxy || GEMINI_BASE_URL,
            "/v1beta"
          );
          options.apiKey = multiApiKeyPolling(apiKey);
        } else {
          options.baseURL = location.origin + "/api/ai/google/v1beta";
        }
        break;
      case "google-vertex":
        const {
          googleVertexProject,
          googleVertexLocation,
          googleClientEmail,
          googlePrivateKey,
          googlePrivateKeyId,
        } = useSettingStore.getState();
        if (mode === "local") {
          options.auth = {
            project: googleVertexProject,
            location: googleVertexLocation,
          };
          if (googleClientEmail && googlePrivateKey) {
            options.auth.clientEmail = googleClientEmail;
            options.auth.privateKey = googlePrivateKey;
            if (googlePrivateKeyId) {
              options.auth.privateKeyId = googlePrivateKeyId;
            }
          }
        } else {
          options.baseURL = location.origin + "/api/ai/google-vertex";
        }
        break;
      case "openai":
        const { openAIApiKey = "", openAIApiProxy } =
          useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(
            openAIApiProxy || OPENAI_BASE_URL,
            "/v1"
          );
          options.apiKey = multiApiKeyPolling(openAIApiKey);
        } else {
          options.baseURL = location.origin + "/api/ai/openai/v1";
        }
        break;
      case "anthropic":
        const { anthropicApiKey = "", anthropicApiProxy } =
          useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(
            anthropicApiProxy || ANTHROPIC_BASE_URL,
            "/v1"
          );
          options.headers = {
            // Avoid cors error
            "anthropic-dangerous-direct-browser-access": "true",
          };
          options.apiKey = multiApiKeyPolling(anthropicApiKey);
        } else {
          options.baseURL = location.origin + "/api/ai/anthropic/v1";
        }
        break;
      case "deepseek":
        const { deepseekApiKey = "", deepseekApiProxy } =
          useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(
            deepseekApiProxy || DEEPSEEK_BASE_URL,
            "/v1"
          );
          options.apiKey = multiApiKeyPolling(deepseekApiKey);
        } else {
          options.baseURL = location.origin + "/api/ai/deepseek/v1";
        }
        break;
      case "xai":
        const { xAIApiKey = "", xAIApiProxy } = useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(xAIApiProxy || XAI_BASE_URL, "/v1");
          options.apiKey = multiApiKeyPolling(xAIApiKey);
        } else {
          options.baseURL = location.origin + "/api/ai/xai/v1";
        }
        break;
      case "mistral":
        const { mistralApiKey = "", mistralApiProxy } =
          useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(
            mistralApiProxy || MISTRAL_BASE_URL,
            "/v1"
          );
          options.apiKey = multiApiKeyPolling(mistralApiKey);
        } else {
          options.baseURL = location.origin + "/api/ai/mistral/v1";
        }
        break;
      case "azure":
        const {
          azureApiKey = "",
          azureResourceName,
          azureApiVersion,
        } = useSettingStore.getState();
        if (mode === "local") {
          options.auth = {
            resourceName: azureResourceName,
            apiKey: multiApiKeyPolling(azureApiKey),
            apiVersion: azureApiVersion,
          };
        } else {
          options.baseURL = location.origin + "/api/ai/azure";
        }
        break;
      case "openrouter":
        const { openRouterApiKey = "", openRouterApiProxy } =
          useSettingStore.getState();
        if (mode === "local") {
          const baseUrl = openRouterApiProxy || OPENROUTER_BASE_URL;
          options.baseURL = completePath(
            baseUrl,
            baseUrl.endsWith("/api") ? "/v1" : "/api/v1"
          );
          options.apiKey = multiApiKeyPolling(openRouterApiKey);
        } else {
          options.baseURL = location.origin + "/api/ai/openrouter/api/v1";
        }
        break;
      case "openaicompatible":
        const { openAICompatibleApiKey = "", openAICompatibleApiProxy } =
          useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(openAICompatibleApiProxy, "/v1");
          options.apiKey = multiApiKeyPolling(openAICompatibleApiKey);
        } else {
          options.baseURL = location.origin + "/api/ai/openaicompatible/v1";
        }
        break;
      case "pollinations":
        const { pollinationsApiProxy } = useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(
            pollinationsApiProxy || POLLINATIONS_BASE_URL,
            "/v1"
          );
        } else {
          options.baseURL = location.origin + "/api/ai/pollinations/v1";
        }
        break;
      case "ollama":
        const { ollamaApiProxy } = useSettingStore.getState();
        if (mode === "local") {
          options.baseURL = completePath(
            ollamaApiProxy || OLLAMA_BASE_URL,
            "/api"
          );
        } else {
          options.baseURL = location.origin + "/api/ai/ollama/api";
          options.headers = {
            Authorization: generateSignature(accessPassword, Date.now()),
          };
        }
        break;
      default:
        break;
    }

    if (mode === "proxy") {
      options.apiKey = generateSignature(accessPassword, Date.now());
    }

    return await createAIProvider(options);
  }

  function getModel(): { model: string } {
    const { provider } = useSettingStore.getState();

    switch (provider) {
      case "google":
        const { model } = useSettingStore.getState();
        return { model };
      case "google-vertex":
        const { googleVertexThinkingModel } =
          useSettingStore.getState();
        return {
          model: googleVertexThinkingModel,
        };
      case "openai":
        const { openAIThinkingModel } =
          useSettingStore.getState();
        return {
          model: openAIThinkingModel,
        };
      case "anthropic":
        const { anthropicThinkingModel } =
          useSettingStore.getState();
        return {
          model: anthropicThinkingModel,
        };
      case "deepseek":
        const { deepseekThinkingModel } =
          useSettingStore.getState();
        return {
          model: deepseekThinkingModel,
        };
      case "xai":
        const { xAIThinkingModel } =
          useSettingStore.getState();
        return {
          model: xAIThinkingModel,
        };
      case "mistral":
        const { mistralThinkingModel } =
          useSettingStore.getState();
        return {
          model: mistralThinkingModel,
        };
      case "azure":
        const { azureThinkingModel } =
          useSettingStore.getState();
        return {
          model: azureThinkingModel,
        };
      case "openrouter":
        const { openRouterThinkingModel } =
          useSettingStore.getState();
        return {
          model: openRouterThinkingModel,
        };
      case "openaicompatible":
        const {
          openAICompatibleThinkingModel,
        } = useSettingStore.getState();
        return {
          model: openAICompatibleThinkingModel,
        };
      case "pollinations":
        const { pollinationsThinkingModel } =
          useSettingStore.getState();
        return {
          model: pollinationsThinkingModel,
        };
      case "ollama":
        const { ollamaThinkingModel } =
          useSettingStore.getState();
        return {
          model: ollamaThinkingModel,
        };
      default:
        throw new Error("Unsupported Provider: " + provider);
    }
  }

  function hasApiKey(): boolean {
    const { provider } = useSettingStore.getState();

    switch (provider) {
      case "google":
        const { apiKey } = useSettingStore.getState();
        return apiKey.length > 0;
      case "google-vertex":
        const { googleVertexProject, googleVertexLocation } =
          useSettingStore.getState();
        return googleVertexProject !== "" && googleVertexLocation !== "";
      case "openai":
        const { openAIApiKey } = useSettingStore.getState();
        return openAIApiKey.length > 0;
      case "anthropic":
        const { anthropicApiKey } = useSettingStore.getState();
        return anthropicApiKey.length > 0;
      case "deepseek":
        const { deepseekApiKey } = useSettingStore.getState();
        return deepseekApiKey.length > 0;
      case "xai":
        const { xAIApiKey } = useSettingStore.getState();
        return xAIApiKey.length > 0;
      case "mistral":
        const { mistralApiKey } = useSettingStore.getState();
        return mistralApiKey.length > 0;
      case "azure":
        const { azureApiKey } = useSettingStore.getState();
        return azureApiKey.length > 0;
      case "openrouter":
        const { openRouterApiKey } = useSettingStore.getState();
        return openRouterApiKey.length > 0;
      case "openaicompatible":
        const { openAICompatibleApiKey } = useSettingStore.getState();
        return openAICompatibleApiKey.length > 0;
      case "pollinations":
      case "ollama":
        return true;
      default:
        throw new Error("Unsupported Provider: " + provider);
    }
  }

  return {
    createModelProvider,
    getModel,
    hasApiKey,
  };
}

export default useModelProvider;
