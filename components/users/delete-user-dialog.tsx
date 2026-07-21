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
import { useDeleteUserMutation, type User } from "@/store/api/users-api"

type DeleteUserDialogProps = {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({
    user,
    open,
    onOpenChange,
}: DeleteUserDialogProps) {
    const [error, setError] = useState<string | null>(null)
    const [deleteUser, { isLoading }] = useDeleteUserMutation()

    async function handleConfirm() {
        if (!user) return
        setError(null)

        try {
            await deleteUser(user.id).unwrap()
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(err, "Não foi possível remover o usuário.")
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
                    <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja remover{" "}
                        <span className="font-medium text-foreground">
                            {user?.name}
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
