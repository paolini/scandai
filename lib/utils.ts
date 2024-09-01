import dayjs from "dayjs"

export function formatDate(date:string) {
    if (!date) return '---'
    return dayjs(date).format("D.M.YYYY")
}

export function formatTime(date:string) {
    if (!date) return '---'
    return dayjs(date).format("HH:mm")
}

// l'anno scolastico inizia col primo luglio:
const SCHOOL_MONTH_STRING = '07'
const SCHOOL_MONTH_COUNT = parseInt(SCHOOL_MONTH_STRING) - 1

export function currentSchoolYear() {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    return currentDate.getMonth()>= SCHOOL_MONTH_COUNT ? year : year-1
}

export function schoolYearMatch(n: number) {
    // l'anno scolastico finisce con l'inizio di luglio
    return {
        $gte: new Date(`${n}-${SCHOOL_MONTH_STRING}-01`),
        $lt: new Date(`${n+1}-${SCHOOL_MONTH_STRING}-01`),
    }
}

export function requireSingle(value: undefined|string|string[], default_value: string=''):string {
    if (value === undefined) return default_value
    if (Array.isArray(value)) return default_value
    return value
}

export function requireArray(value: undefined|string|string[], default_value: string[] = []):string[] {
    if (value === undefined) return default_value
    if (Array.isArray(value)) return value
    return [value]
}

