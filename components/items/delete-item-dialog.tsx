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
import {
    useDeleteItemMutation,
    type Item,
} from "@/store/api/items-api"

type DeleteItemDialogProps = {
    item: Item | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteItemDialog({
    item,
    open,
    onOpenChange,
}: DeleteItemDialogProps) {
    const [error, setError] = useState<string | null>(null)
    const [deleteItem, { isLoading }] = useDeleteItemMutation()

    async function handleConfirm() {
        if (!item) return

        setError(null)

        try {
            await deleteItem(item.id).unwrap()
            onOpenChange(false)
        } catch (err) {
            setError(getApiErrorMessage(err, "Não foi possível remover o item."))
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
                    <AlertDialogTitle>Remover item</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja remover{" "}
                        <span className="font-medium text-foreground">
                            {item?.name}
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
