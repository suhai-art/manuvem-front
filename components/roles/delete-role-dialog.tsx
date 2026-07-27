"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getApiErrorMessage } from "@/lib/api-error"
import { useDeleteRoleMutation, type Role } from "@/store/api/roles-api"

type DeleteRoleDialogProps = {
    role: Role | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteRoleDialog({
    role,
    open,
    onOpenChange,
}: DeleteRoleDialogProps) {
    const [error, setError] = useState<string | null>(null)
    const [deleteRole, { isLoading }] = useDeleteRoleMutation()

    async function handleConfirm() {
        if (!role) return
        setError(null)

        try {
            await deleteRole(role.id).unwrap()
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    "Não foi possível remover o perfil."
                )
            )
        }
    }

    return (
        <AlertDialog
            open={open}
            onOpenChange={(next) => {
                if (!next) setError(null)
                onOpenChange(next)
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remover Perfil</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja remover{" "}
                        <span className="font-medium text-foreground">
                            {role?.name}
                        </span>
                        ? Esta ação pode ser revertida apenas no sistema.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                ) : null}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={isLoading}
                        onClick={(event) => {
                            event.preventDefault()
                            void handleConfirm()
                        }}
                    >
                        {isLoading ? "Removendo..." : "Remover"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
