"use client"

import { useAppSelector } from "@/store/hooks"

export default function Page() {
    const { slug, hostname } = useAppSelector((state) => state.tenant)

    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-2 p-6">
            <p className="text-sm text-muted-foreground">Tenant atual</p>
            <h1 className="text-2xl font-semibold tracking-tight">
                {slug ?? "nenhum"}
            </h1>
            {hostname ? (
                <p className="text-sm text-muted-foreground">{hostname}</p>
            ) : null}
        </main>
    )
}
