"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/lib/api-error"
import {
    useCreateTenantMutation,
    useUpdateTenantMutation,
    type Tenant,
    type TenantPayload,
} from "@/store/api/tenants-api"

type TenantFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenant?: Tenant | null
}

type FormState = {
    id: string
    name: string
    domains: string
}

const emptyForm: FormState = {
    id: "",
    name: "",
    domains: "",
}

function toFormState(tenant?: Tenant | null): FormState {
    if (!tenant) return emptyForm

    return {
        id: tenant.id,
        name: tenant.name,
        domains: tenant.domains.join(", "),
    }
}

export function TenantFormDialog({
    open,
    onOpenChange,
    tenant = null,
}: TenantFormDialogProps) {
    const isEditing = Boolean(tenant)
    const [form, setForm] = useState<FormState>(() => toFormState(tenant))
    const [error, setError] = useState<string | null>(null)
    const [createTenant, { isLoading: isCreating }] = useCreateTenantMutation()
    const [updateTenant, { isLoading: isUpdating }] = useUpdateTenantMutation()

    const isLoading = isCreating || isUpdating

    function updateField<K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) {
        setForm((current) => ({ ...current, [key]: value }))
    }

    function parseDomains(value: string): string[] {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        const domains = parseDomains(form.domains)

        if (!form.id.trim() || !form.name.trim() || domains.length === 0) {
            setError("Preencha todos os campos corretamente.")
            return
        }

        const payload: TenantPayload = {
            id: form.id.trim(),
            name: form.name.trim(),
            domains,
        }

        try {
            if (isEditing && tenant) {
                await updateTenant({ id: tenant.id, body: payload }).unwrap()
            } else {
                await createTenant(payload).unwrap()
            }
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    isEditing
                        ? "Não foi possível atualizar o tenant."
                        : "Não foi possível criar o tenant."
                )
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {open ? (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditing ? "Editar tenant" : "Novo tenant"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? "Atualize os dados do tenant selecionado."
                                    : "Informe os dados para cadastrar um novo tenant."}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="py-4">
                            <Field>
                                <FieldLabel htmlFor="id">ID</FieldLabel>
                                <Input
                                    id="id"
                                    value={form.id}
                                    onChange={(e) =>
                                        updateField("id", e.target.value)
                                    }
                                    required
                                    disabled={isLoading || isEditing}
                                    placeholder="Identificador do tenant"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="name">Nome</FieldLabel>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) =>
                                        updateField("name", e.target.value)
                                    }
                                    required
                                    disabled={isLoading}
                                    placeholder="Nome do tenant"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="domains">Domínios</FieldLabel>
                                <Input
                                    id="domains"
                                    value={form.domains}
                                    onChange={(e) =>
                                        updateField("domains", e.target.value)
                                    }
                                    required
                                    disabled={isLoading}
                                    placeholder="ex.: app.localhost, painel.localhost"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Separe múltiplos domínios por vírgula.
                                </p>
                            </Field>
                            {error ? <FieldError>{error}</FieldError> : null}
                        </FieldGroup>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Salvando..."
                                    : isEditing
                                      ? "Salvar"
                                      : "Criar"}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
