const DEFAULT_REDIRECT = "/dashboard"

export function getSafeRedirect(value: string | null | undefined): string | null {
    if (!value) return null

    if (!value.startsWith("/") || value.startsWith("//")) {
        return null
    }

    return value
}

export function resolvePostLoginRedirect(
    value: string | null | undefined
): string {
    return getSafeRedirect(value) ?? DEFAULT_REDIRECT
}
