"use client"

import { useEffect, useState } from "react"
import {
    MoreHorizontalIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
} from "lucide-react"

import { DeleteClientDialog } from "@/components/clients/delete-client-dialog"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
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
import { useFindClientsQuery, type Client } from "@/store/api/clients-api"

export function ClientssModule() {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [query, setQuery] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [deletingClient, setDeletingClient] = useState<Client | null>(null)

    const { data, isLoading, isFetching, isError, error } = useFindClientsQuery(
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
        setEditingClient(null)
        setFormOpen(true)
    }

    function openEdit(client: Client) {
        setEditingClient(client)
        setFormOpen(true)
    }

    const clients = data?.data ?? []
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
                        Clientes
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Cadastre e gerencie os clientes.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <PlusIcon data-icon="inline-start" />
                    Novo cliente
                </Button>
            </div>

            <div className="relative max-w-sm">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por nome ou documento..."
                    className="pl-7"
                />
            </div>

            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Documento</TableHead>
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
                                        ? "Não foi possível carregar os clientes."
                                        : "Erro ao carregar os clientes."}
                                </TableCell>
                            </TableRow>
                        ) : clients.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {query
                                        ? "Nenhum cliente encontrado para a busca."
                                        : "Nenhum cliente cadastrado ainda."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow
                                    key={client.id}
                                    className={
                                        isFetching ? "opacity-70" : undefined
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {client.name}
                                    </TableCell>
                                    <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                                        {client.document}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Ações de ${client.name}`}
                                                >
                                                    <MoreHorizontalIcon />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEdit(client)
                                                    }
                                                >
                                                    <PencilIcon />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() =>
                                                        setDeletingClient(
                                                            client
                                                        )
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

            <ClientFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open)
                    if (!open) setEditingClient(null)
                }}
                client={editingClient}
            />

            <DeleteClientDialog
                client={deletingClient}
                open={Boolean(deletingClient)}
                onOpenChange={(open) => {
                    if (!open) setDeletingClient(null)
                }}
            />
        </div>
    )
}
