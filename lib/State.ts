export default State

export type StateUpdater<T> = (old:T) => T
export type StateSetter<T> = (setter: StateUpdater<T>) => void
export type State<T> = [T, StateSetter<T>]

export function value<T>([value, setValue]: State<T>): T {
    return value
}

export function set<T>([value, setValue]: State<T>, newValue: T): void {
    setValue((old:T) => newValue)
}

export function update<T>([value, setValue]: State<T>, f: ((oldValue:T)=>T)): void {
    setValue(f)
}

export function push<T>([value, setValue]: State<T[]>, newValue: T): void {
    setValue(old => [...old, newValue])
}

export function get<T, K extends keyof T>([val, setValue]: State<T>, field: K): State<T[K]> {
    return [
        val[field], 
        (f:StateUpdater<T[K]>) => setValue((oldT:T) => (
            {
                ...oldT, 
                [field]: f(oldT[field])
            }
        ))
    ]
}

export function array<T>([arr, setArr]: State<T[]>): State<T>[] {
    return arr.map((x:T) => (
        [   
            x, 
            (updater: StateUpdater<T>) => 
                setArr((oldArr:T[]) => oldArr.map((y:T) => (y === x ? updater(y) : y)))
        ]))
}

export function remove<T>([arr, setArr]: State<T[]>, item: T): void {
    setArr(oldArr => oldArr.filter((x: T) => x !== item))
}