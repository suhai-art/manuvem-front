"use client"

import { navItems } from "@/components/app-sidebar"
import { usePermission } from "@/hooks/usePermissions"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function HomeModule() {
    const { can } = usePermission()
    const itensPermitidos = navItems.filter((item) => {
        return can(item.permission)
    })

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,180px))] justify-center gap-6">
            {itensPermitidos.map((item) => {
                const Icon = item.icon

                return (
                    <Link key={item.title} href={item.url}>
                        <Card className="aspect-square cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
                            <CardContent className="flex h-full flex-col items-center justify-center gap-4">
                                <Icon className="h-10 w-10" />
                                <span className="text-center font-medium">
                                    {item.title}
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                )
            })}
        </div>
    )
}
