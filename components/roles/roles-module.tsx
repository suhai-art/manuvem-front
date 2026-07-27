"use client"

import { useEffect, useState } from "react"
import {
    MoreHorizontalIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
} from "lucide-react"

import { DeleteRoleDialog } from "@/components/roles/delete-role-dialog"
import { RoleFormDialog } from "@/components/roles/role-form-dialog"
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
import { useFindRolesQuery, type Role } from "@/store/api/roles-api"
import { usePermission } from "@/hooks/usePermissions"

export function RolesModule() {
    const { can } = usePermission()
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [query, setQuery] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [deletingRole, setDeletingRole] = useState<Role | null>(null)

    const { data, isLoading, isFetching, isError, error } = useFindRolesQuery({
        page,
        per_page: 15,
        query: query || undefined,
    })

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setPage(1)
            setQuery(searchInput.trim())
        }, 350)

        return () => window.clearTimeout(timeout)
    }, [searchInput])

    function openCreate() {
        setEditingRole(null)
        setFormOpen(true)
    }

    function openEdit(role: Role) {
        setEditingRole(role)
        setFormOpen(true)
    }

    const roles = data?.data ?? []
    const meta = data?.meta
    const total = meta?.total ?? 0
    const lastPage = meta?.last_page ?? 1
    const currentPage = meta?.current_page ?? page
    const perPage = meta?.per_page ?? 15
    const from = total > 0 ? (currentPage - 1) * perPage + 1 : null
    const to = total > 0 ? Math.min(currentPage * perPage, total) : null

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Perfis de acesso
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie os perfis e permissões disponíveis no sistema.
                    </p>
                </div>
                {can("role.create") && (
                    <Button onClick={openCreate}>
                        <PlusIcon data-icon="inline-start" />
                        Novo perfil
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
                            <TableHead>Permissões</TableHead>
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
                                        <Skeleton className="h-4 w-20" />
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
                                    colSpan={4}
                                    className="h-24 text-center text-destructive"
                                >
                                    {error &&
                                    typeof error === "object" &&
                                    "status" in error
                                        ? "Não foi possível carregar os perfis."
                                        : "Erro ao carregar os perfis."}
                                </TableCell>
                            </TableRow>
                        ) : roles.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {query
                                        ? "Nenhum perfil encontrado para a busca."
                                        : "Nenhum perfil cadastrado ainda."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role) => (
                                <TableRow
                                    key={role.id}
                                    className={
                                        isFetching ? "opacity-70" : undefined
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {role.name}
                                    </TableCell>
                                    <TableCell>
                                        {role.permissions.length}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Ações de ${role.name}`}
                                                >
                                                    <MoreHorizontalIcon />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEdit(role)
                                                    }
                                                >
                                                    <PencilIcon />
                                                    Editar
                                                </DropdownMenuItem>
                                                {can("role.delete") && (
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setDeletingRole(
                                                                role
                                                            )
                                                        }
                                                    >
                                                        <Trash2Icon />
                                                        Remover
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || isFetching}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            Anterior
                        </Button>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {page} / {lastPage}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= lastPage || isFetching}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            ) : null}

            <RoleFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open)
                    if (!open) setEditingRole(null)
                }}
                role={editingRole}
            />

            <DeleteRoleDialog
                role={deletingRole}
                open={Boolean(deletingRole)}
                onOpenChange={(open) => {
                    if (!open) setDeletingRole(null)
                }}
            />
        </div>
    )
}
