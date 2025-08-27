
// This file acts as a factory to dynamically load all Genkit flows.
// It is only ever imported by server actions, ensuring that the flow
// definitions are not part of the client-side bundle.

export async function getFlows() {
    const { analyzeDataFlow } = await import("./flows/analyze-data-flow");
    const { rephraseDescriptionFlow } = await import("./flows/rephrase-description");
    const { suggestCategoryFlow } = await import("./flows/suggest-category");
    const { suggestMitigationStrategiesFlow } = await import("./flows/suggest-mitigation-strategies");
    const { suggestSimilarIssuesFlow } = await import("./flows/suggest-similar-issues");
    const { suggestSimilarRisksFlow } = await import("./flows/suggest-similar-risks");
    const { suggestTitleFlow } = await import("./flows/suggest-title");

    return {
        analyzeDataFlow,
        rephraseDescriptionFlow,
        suggestCategoryFlow,
        suggestMitigationStrategiesFlow,
        suggestSimilarIssuesFlow,
        suggestSimilarRisksFlow,
        suggestTitleFlow
    };
}
