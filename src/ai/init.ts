
// This file is a barrel for exporting your AI flows.
// It is used by the dev server to discover your flows.
import './flows/analyze-data-flow';
import './flows/rephrase-description';
import './flows/suggest-category';
import './flows/suggest-mitigation-strategies';
import './flows/suggest-similar-issues';
import './flows/suggest-similar-risks';
import './flows/suggest-title';
import './tools/get-project-data-tool';
import type { RephraseDescriptionOutput, RephraseDescriptionInput } from "./flows/rephrase-description";
import type { SuggestCategoryOutput, SuggestCategoryInput } from "./flows/suggest-category";
import type { SuggestMitigationStrategiesOutput, SuggestMitigationStrategiesInput } from "./flows/suggest-mitigation-strategies";
import type { SuggestSimilarIssuesOutput, SuggestSimilarIssuesInput } from "./flows/suggest-similar-issues";
import type { SuggestSimilarRisksOutput, SuggestSimilarRisksInput } from "./flows/suggest-similar-risks";
import type { SuggestTitleOutput, SuggestTitleInput } from "./flows/suggest-title";

// This is a barrel file used to re-export types for use in server actions.
// This prevents the "use server" build error.
export type {
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
