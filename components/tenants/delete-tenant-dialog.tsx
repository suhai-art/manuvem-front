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
import { useDeleteTenantMutation, type Tenant } from "@/store/api/tenants-api"

type DeleteTenantDialogProps = {
    tenant: Tenant | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteTenantDialog({
    tenant,
    open,
    onOpenChange,
}: DeleteTenantDialogProps) {
    const [error, setError] = useState<string | null>(null)
    const [deleteTenant, { isLoading }] = useDeleteTenantMutation()

    async function handleConfirm() {
        if (!tenant) return
        setError(null)

        try {
            await deleteTenant(tenant.id).unwrap()
            onOpenChange(false)
        } catch (err) {
            setError(
                getApiErrorMessage(err, "Não foi possível remover o tenant.")
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
                    <AlertDialogTitle>Remover Tenant</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja remover{" "}
                        <span className="font-medium text-foreground">
                            {tenant?.name}
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
