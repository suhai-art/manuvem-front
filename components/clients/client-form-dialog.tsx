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
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/api-error"
import {
    useCreateClientMutation,
    useUpdateClientMutation,
    type Client,
    type ClientPayload,
} from "@/store/api/clients-api"

type ClientFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    client?: Client | null
}

type FormState = {
    name: string
    document: string
}

const emptyForm: FormState = {
    name: "",
    document: "",
}

function toFormState(client?: Client | null): FormState {
    if (!client) return emptyForm

    return {
        name: client.name,
        document: client.document,
    }
}

function ClientFormFields({
    client,
    onOpenChange,
}: {
    client?: Client | null
    onOpenChange: (open: boolean) => void
}) {
    const isEditing = Boolean(client)
    const [form, setForm] = useState<FormState>(() => toFormState(client))
    const [error, setError] = useState<string | null>(null)
    const [createClient, { isLoading: isCreating }] = useCreateClientMutation()
    const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation()
    const isLoading = isCreating || isUpdating

    function updateField<K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) {
        setForm((current) => ({ ...current, [key]: value }))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        const payload: ClientPayload = {
            name: form.name.trim(),
            document: form.document.trim(),
        }

        if (!payload.name || !payload.document) {
            setError("Preencha todos os campos corretamente.")
            return
        }

        try {
            if (isEditing && client) {
                await updateClient({ id: client.id, body: payload }).unwrap()
            } else {
                await createClient(payload).unwrap()
            }
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    isEditing
                        ? "Não foi possível atualizar o cliente."
                        : "Não foi possível criar o cliente."
                )
            )
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>
                    {isEditing ? "Editar cliente" : "Novo cliente"}
                </DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? "Atualize os dados do cliente selecionado."
                        : "Informe os dados para cadastrar um novo cliente."}
                </DialogDescription>
            </DialogHeader>

            <FieldGroup className="py-4">
                <Field>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="Nome do cliente"
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="document">
                        Documento do cliente
                    </FieldLabel>
                    <Input
                        id="document"
                        value={form.document}
                        onChange={(e) =>
                            updateField("document", e.target.value)
                        }
                        required
                        disabled={isLoading}
                        placeholder="Documento do cliente"
                    />
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
                    {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
                </Button>
            </DialogFooter>
        </form>
    )
}

export function ClientFormDialog({
    open,
    onOpenChange,
    client = null,
}: ClientFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {open ? (
                    <ClientFormFields
                        key={client?.id ?? "new"}
                        client={client}
                        onOpenChange={onOpenChange}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
