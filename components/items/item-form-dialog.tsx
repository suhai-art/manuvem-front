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
    useCreateItemMutation,
    useUpdateItemMutation,
    type Item,
    type ItemPayload,
} from "@/store/api/items-api"

type ItemFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    item?: Item | null
}

type FormState = {
    internal_code: string
    name: string
    description: string
    default_unit_price: string
}

const emptyForm: FormState = {
    internal_code: "",
    name: "",
    description: "",
    default_unit_price: "",
}

function toFormState(item?: Item | null): FormState {
    if (!item) return emptyForm

    return {
        internal_code: item.internal_code,
        name: item.name,
        description: item.description,
        default_unit_price: String(item.default_unit_price),
    }
}

function ItemFormFields({
    item,
    onOpenChange,
}: {
    item?: Item | null
    onOpenChange: (open: boolean) => void
}) {
    const isEditing = Boolean(item)
    const [form, setForm] = useState<FormState>(() => toFormState(item))
    const [error, setError] = useState<string | null>(null)
    const [createItem, { isLoading: isCreating }] = useCreateItemMutation()
    const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation()
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

        const payload: ItemPayload = {
            internal_code: form.internal_code.trim(),
            name: form.name.trim(),
            description: form.description.trim(),
            default_unit_price: Number(form.default_unit_price),
        }

        if (
            !payload.internal_code ||
            !payload.name ||
            !payload.description ||
            Number.isNaN(payload.default_unit_price)
        ) {
            setError("Preencha todos os campos corretamente.")
            return
        }

        try {
            if (isEditing && item) {
                await updateItem({ id: item.id, body: payload }).unwrap()
            } else {
                await createItem(payload).unwrap()
            }
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    isEditing
                        ? "Não foi possível atualizar o item."
                        : "Não foi possível criar o item."
                )
            )
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>
                    {isEditing ? "Editar item" : "Novo item"}
                </DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? "Atualize os dados do item selecionado."
                        : "Informe os dados para cadastrar um novo item."}
                </DialogDescription>
            </DialogHeader>

            <FieldGroup className="py-4">
                <Field>
                    <FieldLabel htmlFor="internal_code">
                        Código interno
                    </FieldLabel>
                    <Input
                        id="internal_code"
                        value={form.internal_code}
                        onChange={(e) =>
                            updateField("internal_code", e.target.value)
                        }
                        required
                        disabled={isLoading}
                        placeholder="ITEM-0001"
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="Nome do item"
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="description">Descrição</FieldLabel>
                    <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) =>
                            updateField("description", e.target.value)
                        }
                        required
                        disabled={isLoading}
                        placeholder="Descrição do item"
                        rows={3}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="default_unit_price">
                        Preço unitário padrão
                    </FieldLabel>
                    <Input
                        id="default_unit_price"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={form.default_unit_price}
                        onChange={(e) =>
                            updateField("default_unit_price", e.target.value)
                        }
                        required
                        disabled={isLoading}
                        placeholder="0.00"
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
                    {isLoading
                        ? "Salvando..."
                        : isEditing
                          ? "Salvar"
                          : "Criar"}
                </Button>
            </DialogFooter>
        </form>
    )
}

export function ItemFormDialog({
    open,
    onOpenChange,
    item = null,
}: ItemFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {open ? (
                    <ItemFormFields
                        key={item?.id ?? "new"}
                        item={item}
                        onOpenChange={onOpenChange}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
