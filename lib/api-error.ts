export function getApiErrorMessage(
    err: unknown,
    fallback = "Ocorreu um erro. Tente novamente."
): string {
    if (!err || typeof err !== "object") {
        return fallback
    }

    if (!("data" in err) || !err.data || typeof err.data !== "object") {
        return fallback
    }

    const data = err.data as Record<string, unknown>

    if (typeof data.message === "string" && data.message) {
        return data.message
    }

    if (data.errors && typeof data.errors === "object") {
        const first = Object.values(data.errors as Record<string, unknown>)[0]
        if (Array.isArray(first) && typeof first[0] === "string") {
            return first[0]
        }
        if (typeof first === "string") {
            return first
        }
    }

    return fallback
}

export function formatCurrency(value: string | number) {
    const amount = typeof value === "string" ? Number(value) : value

    if (Number.isNaN(amount)) {
        return String(value)
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(amount)
}
