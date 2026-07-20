"use client"

import { useEffect, useState } from "react"
import { MoreHorizontalIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"

import { DeleteItemDialog } from "@/components/items/delete-item-dialog"
import { ItemFormDialog } from "@/components/items/item-form-dialog"
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
import { formatCurrency } from "@/lib/api-error"
import { useFindItemsQuery, type Item } from "@/store/api/items-api"

export function ItemsModule() {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [query, setQuery] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Item | null>(null)
    const [deletingItem, setDeletingItem] = useState<Item | null>(null)

    const { data, isLoading, isFetching, isError, error } = useFindItemsQuery({
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
        setEditingItem(null)
        setFormOpen(true)
    }

    function openEdit(item: Item) {
        setEditingItem(item)
        setFormOpen(true)
    }

    const items = data?.data ?? []
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
                        Itens
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Cadastre e gerencie os itens do catálogo.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <PlusIcon data-icon="inline-start" />
                    Novo item
                </Button>
            </div>

            <div className="relative max-w-sm">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar por nome ou código..."
                    className="pl-7"
                />
            </div>

            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead className="hidden md:table-cell">
                                Descrição
                            </TableHead>
                            <TableHead className="text-right">
                                Preço padrão
                            </TableHead>
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
                                    <TableCell className="hidden md:table-cell">
                                        <Skeleton className="h-4 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="ml-auto h-4 w-16" />
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
                                        ? "Não foi possível carregar os itens."
                                        : "Erro ao carregar os itens."}
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {query
                                        ? "Nenhum item encontrado para a busca."
                                        : "Nenhum item cadastrado ainda."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className={
                                        isFetching ? "opacity-70" : undefined
                                    }
                                >
                                    <TableCell className="font-mono text-xs">
                                        {item.internal_code}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                                        {item.description}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {formatCurrency(item.default_unit_price)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Ações de ${item.name}`}
                                                >
                                                    <MoreHorizontalIcon />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => openEdit(item)}
                                                >
                                                    <PencilIcon />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() =>
                                                        setDeletingItem(item)
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

            <ItemFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open)
                    if (!open) setEditingItem(null)
                }}
                item={editingItem}
            />

            <DeleteItemDialog
                item={deletingItem}
                open={Boolean(deletingItem)}
                onOpenChange={(open) => {
                    if (!open) setDeletingItem(null)
                }}
            />
        </div>
    )
}
