"use client"

import { useEffect, useState } from "react"
import {
    MoreHorizontalIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
} from "lucide-react"

import { DeleteUserDialog } from "@/components/users/delete-user-dialog"
import { UserFormDialog } from "@/components/users/user-form-dialog"
import { Badge } from "@/components/ui/badge"
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
import { useFindUsersQuery, type User } from "@/store/api/users-api"

export function UsersModule() {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [query, setQuery] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)

    const { data, isLoading, isFetching, isError, error } = useFindUsersQuery(
        {
            page,
            per_page: 15,
            query: query || undefined,
        }
    )

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setPage(1)
            setQuery(searchInput.trim())
        }, 350)

        return () => window.clearTimeout(timeout)
    }, [searchInput])

    function openCreate() {
        setEditingUser(null)
        setFormOpen(true)
    }

    function openEdit(user: User) {
        setEditingUser(user)
        setFormOpen(true)
    }

    const users = data?.data ?? []
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
                        Acessos
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie os usuários e seus perfis de acesso.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <PlusIcon data-icon="inline-start" />
                    Novo usuário
                </Button>
            </div>

            <div className="relative max-w-sm">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por nome ou email..."
                    className="pl-7"
                />
            </div>

            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Perfil</TableHead>
                            <TableHead>Status</TableHead>
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
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-36" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-12" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="size-7" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-destructive"
                                >
                                    {error &&
                                    typeof error === "object" &&
                                    "status" in error
                                        ? "Não foi possível carregar os usuários."
                                        : "Erro ao carregar os usuários."}
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {query
                                        ? "Nenhum usuário encontrado para a busca."
                                        : "Nenhum usuário cadastrado ainda."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow
                                    key={user.id}
                                    className={
                                        isFetching ? "opacity-70" : undefined
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.role === "admin"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {user.role === "admin"
                                                ? "Admin"
                                                : "Usuário"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.status === "active"
                                                    ? "default"
                                                    : "outline"
                                            }
                                        >
                                            {user.status === "active"
                                                ? "Ativo"
                                                : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Ações de ${user.name}`}
                                                >
                                                    <MoreHorizontalIcon />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => openEdit(user)}
                                                >
                                                    <PencilIcon />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() =>
                                                        setDeletingUser(user)
                                                    }
                                                >
                                                    <Trash2Icon />
                                                    Remover
                                                </DropdownMenuItem>
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

            <UserFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open)
                    if (!open) setEditingUser(null)
                }}
                user={editingUser}
            />

            <DeleteUserDialog
                user={deletingUser}
                open={Boolean(deletingUser)}
                onOpenChange={(open) => {
                    if (!open) setDeletingUser(null)
                }}
            />
        </div>
    )
}
