import type { IQuestion } from './questionary'

export function canReadReportQuestion(
    question: IQuestion,
    user?: { isAdmin?: boolean | null, isViewer?: boolean | null } | null,
): boolean {
    return question.reportAccess !== 'restricted' || !!(user?.isAdmin || user?.isViewer)
}

export function aggregateReportAnswers(
    questions: Record<string, IQuestion>,
    answers: Record<string, unknown>,
    normalizeLanguage: (language: string) => string,
): Record<string, string[]> {
    const derived: Record<string, string[]> = {}
    for (const [code, question] of Object.entries(questions)) {
        if (!question.aggregateFrom) continue
        const sources = question.aggregateFrom.map(source => answers[source]).filter(Array.isArray)
        // Missing sources are different from an explicitly empty answer.
        if (sources.length === 0) continue
        const languages = new Set<string>()
        for (const source of sources) {
            for (const language of source) {
                const normalized = normalizeLanguage(language)
                if (normalized) languages.add(normalized)
            }
        }
        derived[code] = Array.from(languages)
    }
    return derived
}
