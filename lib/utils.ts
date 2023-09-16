import dayjs from "dayjs"

export function formatDate(date:string) {
    if (!date) return '---'
    return dayjs(date).format("D.M.YYYY")
}

export function formatTime(date:string) {
    if (!date) return '---'
    return dayjs(date).format("HH:mm")
}
