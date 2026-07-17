"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { resolvePostLoginRedirect } from "@/lib/auth-redirect"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLoginMutation } from "@/store/api/auth-api"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [login, { isLoading }] = useLoginMutation()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        const formData = new FormData(event.currentTarget)
        const email = String(formData.get("email") ?? "").trim()
        const password = String(formData.get("password") ?? "")

        try {
            await login({ email, password }).unwrap()
            router.push(resolvePostLoginRedirect(searchParams.get("redirect")))
        } catch (err) {
            const message =
                err &&
                typeof err === "object" &&
                "data" in err &&
                err.data &&
                typeof err.data === "object" &&
                "message" in err.data &&
                typeof err.data.message === "string"
                    ? err.data.message
                    : "Falha ao fazer login. Verifique suas credenciais."

            setError(message)
        }
    }

    return (
        <form
            className={cn("flex flex-col gap-6", className)}
            onSubmit={handleSubmit}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">
                        Faça o login na sua conta
                    </h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Insira seu e-mail e entre na sua conta
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@exemplo.com"
                        required
                        autoComplete="email"
                        disabled={isLoading}
                        className="bg-background"
                    />
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Senha</FieldLabel>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="bg-background"
                    />
                </Field>
                {error ? <FieldError>{error}</FieldError> : null}
                <Field>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Entrando..." : "Login"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    )
}
