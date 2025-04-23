import { DocumentNode, MutationHookOptions, useMutation } from "@apollo/client"
import { Button } from "react-bootstrap"

import Error from "./Error"

export default function MutationButton({query, options, variant, disabled, children}: {
    query: DocumentNode,
    options: MutationHookOptions,
    variant?: string,
    disabled?: boolean,
    children: React.ReactNode
}) {
    const [mutate, {loading, error, reset}] = useMutation(query, options)
    if (error) return <Error dismiss={reset}>{`${error.message}`}</Error>
    return <Button variant={variant} disabled={disabled || loading} onClick={() => mutate()}>
        {children}
    </Button>
}
