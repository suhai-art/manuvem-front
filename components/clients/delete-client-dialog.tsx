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
import { useDeleteClientMutation, type Client } from "@/store/api/clients-api"

type DeleteClientDialogProps = {
    client: Client | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteClientDialog({
    client,
    open,
    onOpenChange,
}: DeleteClientDialogProps) {
    const [error, setError] = useState<string | null>(null)
    const [deleteClient, { isLoading }] = useDeleteClientMutation()

    async function handleConfirm() {
        if (!client) return

        setError(null)

        try {
            await deleteClient(client.id).unwrap()
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(err, "Não foi possível remover o cliente.")
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
                    <AlertDialogTitle>Remover Cliente</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja remover{" "}
                        <span className="font-medium text-foreground">
                            {client?.name}
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
