"use client"

import { useState } from "react"
import {
    MoreHorizontalIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
} from "lucide-react"

import { DeleteTenantDialog } from "@/components/tenants/delete-tenant-dialog"
import { TenantFormDialog } from "@/components/tenants/tenant-form-dialog"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useFindTenantsQuery, type Tenant } from "@/store/api/tenants-api"
import { usePermission } from "@/hooks/usePermissions"

function resolveTenants(data: unknown): Tenant[] {
    if (Array.isArray(data)) {
        return data
    }

    if (data && typeof data === "object") {
        const candidate = data as Record<string, unknown>

        if (Array.isArray(candidate.data)) {
            return candidate.data as Tenant[]
        }

        if (Array.isArray(candidate.tenants)) {
            return candidate.tenants as Tenant[]
        }
    }

    return []
}

export function TenantsModule() {
    const { can } = usePermission()
    const [searchInput, setSearchInput] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
    const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null)

    const { data, isLoading, isFetching, isError, error } =
        useFindTenantsQuery()

    const tenants = resolveTenants(data)
    const total = tenants.length
    const from = total > 0 ? 1 : null
    const to = tenants.length > 0 ? tenants.length : null

    function openCreate() {
        setEditingTenant(null)
        setFormOpen(true)
    }

    function openEdit(tenant: Tenant) {
        setEditingTenant(tenant)
        setFormOpen(true)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Tenants
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie os tenants do sistema.
                    </p>
                </div>
                {can("tenant.create") && (
                    <Button onClick={openCreate}>
                        <PlusIcon data-icon="inline-start" />
                        Novo tenant
                    </Button>
                )}
            </div>

            <div className="relative max-w-sm">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por nome..."
                    className="pl-7"
                />
            </div>

            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Domains</TableHead>
                            <TableHead className="w-12">
                                <span className="sr-only">Ações</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="size-7" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="h-24 text-center text-destructive"
                                >
                                    {error &&
                                    typeof error === "object" &&
                                    "status" in error
                                        ? "Não foi possível carregar os tenants."
                                        : "Erro ao carregar os tenants."}
                                </TableCell>
                            </TableRow>
                        ) : tenants.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Nenhum tenant cadastrado ainda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tenants.map((tenant) => (
                                <TableRow
                                    key={tenant.id}
                                    className={
                                        isFetching ? "opacity-70" : undefined
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {tenant.name}
                                    </TableCell>
                                    <TableCell>
                                        {tenant.domains.join(", ")}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Ações de ${tenant.name}`}
                                                >
                                                    <MoreHorizontalIcon />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            {can("tenant.edit") && (
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEdit(tenant)
                                                        }
                                                    >
                                                        <PencilIcon />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    {can("tenant.delete") && (
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setDeletingTenant(
                                                                    tenant
                                                                )
                                                            }
                                                        >
                                                            <Trash2Icon />
                                                            Remover
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            )}
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {total > 0 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {from && to
                            ? `Exibindo ${from}–${to} de ${total}`
                            : `${total} item(ns)`}
                    </p>
                </div>
            ) : null}

            <TenantFormDialog
                key={editingTenant?.id ?? "new"}
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open)
                    if (!open) setEditingTenant(null)
                }}
                tenant={editingTenant}
            />

            <DeleteTenantDialog
                tenant={deletingTenant}
                open={Boolean(deletingTenant)}
                onOpenChange={(open) => {
                    if (!open) setDeletingTenant(null)
                }}
            />
        </div>
    )
}
