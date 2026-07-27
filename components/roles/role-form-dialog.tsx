"use client"

import { useEffect, useState } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api-error"
import {
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useFormOptionsQuery,
    type Role,
    type Permission,
} from "@/store/api/roles-api"

type RoleFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    role?: Role | null
}

type FormState = {
    name: string
    guard_name: string
    permission: number[]
}

const emptyForm: FormState = {
    name: "",
    guard_name: "sanctum",
    permission: [],
}

function toFormState(role?: Role | null): FormState {
    if (!role) return emptyForm

    return {
        name: role.name,
        guard_name: role.guard_name,
        permission: role.permissions.map((permission) => permission.id),
    }
}

function isPermissionSelected(selected: number[], id: number): boolean {
    return selected.includes(id)
}

export function RoleFormDialog({
    open,
    onOpenChange,
    role = null,
}: RoleFormDialogProps) {
    const isEditing = Boolean(role)
    const [form, setForm] = useState<FormState>(emptyForm)
    const [error, setError] = useState<string | null>(null)
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation()
    const {
        data: formOptions,
        isLoading: isFormOptionsLoading,
        error: formOptionsError,
    } = useFormOptionsQuery()

    const isLoading = isCreating || isUpdating || isFormOptionsLoading
    const permissions = formOptions?.permissions ?? []

    const canEditCurrent = Boolean(
        isEditing &&
        role &&
        (formOptionsError ||
            formOptions?.permissions?.some((permission) =>
                role.permissions.some(
                    (rolePermission) => rolePermission.id === permission.id
                )
            ))
    )

    useEffect(() => {
        if (!open) {
            setError(null)
            return
        }

        setError(null)
        setForm(() => toFormState(role))
    }, [open, role])

    function updateField<K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) {
        setForm((current) => ({ ...current, [key]: value }))
    }

    function togglePermission(id: number) {
        setForm((current) => ({
            ...current,
            permission: current.permission.includes(id)
                ? current.permission.filter((item) => item !== id)
                : [...current.permission, id],
        }))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        const payload = {
            name: form.name.trim(),
            guard_name: form.guard_name || "sanctum",
            permission: form.permission,
        }

        if (!payload.name) {
            setError("Informe o nome do perfil.")
            return
        }

        try {
            if (isEditing && role) {
                await updateRole({ id: role.id, body: payload }).unwrap()
            } else {
                await createRole(payload).unwrap()
            }
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    isEditing
                        ? "Não foi possível atualizar o perfil."
                        : "Não foi possível criar o perfil."
                )
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                {open ? (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditing ? "Editar perfil" : "Novo perfil"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? "Atualize o nome e as permissões deste perfil."
                                    : "Informe o nome e as permissões para cadastrar um novo perfil."}
                            </DialogDescription>
                        </DialogHeader>

                        <FieldGroup className="py-4">
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
                                    placeholder="Nome do perfil"
                                />
                            </Field>

                            <Field>
                                <FieldLabel>Permissões</FieldLabel>
                                {isFormOptionsLoading ? (
                                    <p className="text-sm text-muted-foreground">
                                        Carregando permissões...
                                    </p>
                                ) : formOptionsError ? (
                                    <p className="text-sm text-destructive">
                                        Não foi possível carregar as permissões.
                                    </p>
                                ) : (
                                    <div className="flex max-h-52 flex-col gap-3 overflow-y-auto rounded-md border p-3">
                                        {permissions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Nenhuma permissão disponível.
                                            </p>
                                        ) : (
                                            Object.entries(
                                                permissions.reduce<
                                                    Record<string, Permission[]>
                                                >((acc, permission) => {
                                                    const [module] =
                                                        permission.name.split(
                                                            "."
                                                        )
                                                    const key =
                                                        module.trim() ||
                                                        permission.name
                                                    acc[key] = acc[key] || []
                                                    acc[key].push(permission)
                                                    return acc
                                                }, {})
                                            ).map(
                                                ([
                                                    moduleName,
                                                    modulePermissions,
                                                ]) => {
                                                    const allSelected =
                                                        modulePermissions.every(
                                                            (permission) =>
                                                                isPermissionSelected(
                                                                    form.permission,
                                                                    permission.id
                                                                )
                                                        )
                                                    const someSelected =
                                                        modulePermissions.some(
                                                            (permission) =>
                                                                isPermissionSelected(
                                                                    form.permission,
                                                                    permission.id
                                                                )
                                                        ) && !allSelected

                                                    return (
                                                        <div
                                                            key={moduleName}
                                                            className="space-y-1.5"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id={`module-${moduleName}`}
                                                                    checked={
                                                                        allSelected
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) => {
                                                                        const moduleIds =
                                                                            modulePermissions.map(
                                                                                (
                                                                                    permission
                                                                                ) =>
                                                                                    permission.id
                                                                            )
                                                                        const next =
                                                                            checked
                                                                                ? [
                                                                                      ...new Set(
                                                                                          [
                                                                                              ...form.permission,
                                                                                              ...moduleIds,
                                                                                          ]
                                                                                      ),
                                                                                  ]
                                                                                : form.permission.filter(
                                                                                      (
                                                                                          id
                                                                                      ) =>
                                                                                          !moduleIds.includes(
                                                                                              id
                                                                                          )
                                                                                  )
                                                                        updateField(
                                                                            "permission",
                                                                            next
                                                                        )
                                                                    }}
                                                                    disabled={
                                                                        isLoading
                                                                    }
                                                                />
                                                                <label
                                                                    htmlFor={`module-${moduleName}`}
                                                                    className="text-xs font-medium"
                                                                >
                                                                    {moduleName}
                                                                </label>
                                                            </div>
                                                            <div className="ml-6 flex flex-wrap gap-2">
                                                                {modulePermissions.map(
                                                                    (
                                                                        permission
                                                                    ) => {
                                                                        const checked =
                                                                            isPermissionSelected(
                                                                                form.permission,
                                                                                permission.id
                                                                            )

                                                                        return (
                                                                            <button
                                                                                type="button"
                                                                                key={
                                                                                    permission.id
                                                                                }
                                                                                onClick={() =>
                                                                                    togglePermission(
                                                                                        permission.id
                                                                                    )
                                                                                }
                                                                                className={cn(
                                                                                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] transition",
                                                                                    checked
                                                                                        ? "border-foreground bg-foreground text-background"
                                                                                        : "border-input bg-background text-foreground hover:border-foreground",
                                                                                    isLoading
                                                                                        ? "opacity-60"
                                                                                        : ""
                                                                                )}
                                                                                disabled={
                                                                                    isLoading
                                                                                }
                                                                            >
                                                                                <span>
                                                                                    {
                                                                                        permission.name
                                                                                    }
                                                                                </span>
                                                                            </button>
                                                                        )
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            )
                                        )}
                                    </div>
                                )}
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
