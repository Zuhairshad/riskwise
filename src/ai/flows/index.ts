
import type { AnalyzeDataInput, AnalyzeDataOutput } from "./analyze-data-flow";
import type { RephraseDescriptionOutput, RephraseDescriptionInput } from "./rephrase-description";
import type { SuggestCategoryOutput, SuggestCategoryInput } from "./suggest-category";
import type { SuggestMitigationStrategiesOutput, SuggestMitigationStrategiesInput } from "./suggest-mitigation-strategies";
import type { SuggestSimilarIssuesOutput, SuggestSimilarIssuesInput } from "./suggest-similar-issues";
import type { SuggestSimilarRisksOutput, SuggestSimilarRisksInput } from "./suggest-similar-risks";
import type { SuggestTitleOutput, SuggestTitleInput } from "./suggest-title";

// This is a barrel file used to re-export types for use in server actions.
// This prevents the "use server" build error.
export type {
    AnalyzeDataInput,
    AnalyzeDataOutput,
    RephraseDescriptionOutput,
    RephraseDescriptionInput,
    SuggestCategoryOutput,
    SuggestCategoryInput,
    SuggestMitigationStrategiesOutput,
    SuggestMitigationStrategiesInput,
    SuggestSimilarIssuesOutput,
    SuggestSimilarIssuesInput,
    SuggestSimilarRisksOutput,
    SuggestSimilarRisksInput,
    SuggestTitleOutput,
    SuggestTitleInput
}
