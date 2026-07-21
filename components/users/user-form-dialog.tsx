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
    useCreateUserMutation,
    useUpdateUserMutation,
    type User,
    type UserPayload,
} from "@/store/api/users-api"

type UserFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: User | null
}

type FormState = {
    name: string
    email: string
    password: string
    password_confirmation: string
    role: "admin" | "user"
    status: "active" | "inactive"
}

const emptyForm: FormState = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "user",
    status: "active",
}

function toFormState(user?: User | null): FormState {
    if (!user) return emptyForm

    return {
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
        role: user.role,
        status: user.status,
    }
}

function UserFormFields({
    user,
    onOpenChange,
}: {
    user?: User | null
    onOpenChange: (open: boolean) => void
}) {
    const isEditing = Boolean(user)
    const [form, setForm] = useState<FormState>(() => toFormState(user))
    const [error, setError] = useState<string | null>(null)
    const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
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

        const payload: UserPayload = {
            name: form.name.trim(),
            email: form.email.trim(),
            role: form.role,
            status: form.status,
        }

        if (isEditing) {
            if (form.password) {
                if (form.password !== form.password_confirmation) {
                    setError("As senhas não coincidem.")
                    return
                }
                payload.password = form.password
                payload.password_confirmation = form.password_confirmation
            }
        } else {
            if (!form.password) {
                setError("A senha é obrigatória para novos usuários.")
                return
            }
            if (form.password !== form.password_confirmation) {
                setError("As senhas não coincidem.")
                return
            }
            if (form.password.length < 8) {
                setError("A senha deve ter pelo menos 8 caracteres.")
                return
            }
            payload.password = form.password
            payload.password_confirmation = form.password_confirmation
        }

        if (!payload.name || !payload.email) {
            setError("Preencha todos os campos corretamente.")
            return
        }

        try {
            if (isEditing && user) {
                await updateUser({ id: user.id, body: payload }).unwrap()
            } else {
                await createUser(payload).unwrap()
            }
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    isEditing
                        ? "Não foi possível atualizar o usuário."
                        : "Não foi possível criar o usuário."
                )
            )
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>
                    {isEditing ? "Editar usuário" : "Novo usuário"}
                </DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? "Atualize os dados do usuário selecionado."
                        : "Informe os dados para cadastrar um novo usuário."}
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
                        placeholder="Nome completo"
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="m@exemplo.com"
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">
                        {isEditing
                            ? "Nova senha (deixe em branco para manter)"
                            : "Senha"}
                    </FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                            updateField("password", e.target.value)
                        }
                        required={!isEditing}
                        disabled={isLoading}
                        placeholder={
                            isEditing
                                ? "Nova senha (opcional)"
                                : "Mínimo 8 caracteres"
                        }
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password_confirmation">
                        Confirmar senha
                    </FieldLabel>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={form.password_confirmation}
                        onChange={(e) =>
                            updateField(
                                "password_confirmation",
                                e.target.value
                            )
                        }
                        required={!isEditing}
                        disabled={isLoading}
                        placeholder="Confirme a senha"
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="role">Perfil</FieldLabel>
                    <select
                        id="role"
                        value={form.role}
                        onChange={(e) =>
                            updateField(
                                "role",
                                e.target.value as "admin" | "user"
                            )
                        }
                        disabled={isLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="user">Usuário</option>
                        <option value="admin">Admin</option>
                    </select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <select
                        id="status"
                        value={form.status}
                        onChange={(e) =>
                            updateField(
                                "status",
                                e.target.value as "active" | "inactive"
                            )
                        }
                        disabled={isLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </select>
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

export function UserFormDialog({
    open,
    onOpenChange,
    user = null,
}: UserFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {open ? (
                    <UserFormFields
                        key={user?.id ?? "new"}
                        user={user}
                        onOpenChange={onOpenChange}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
