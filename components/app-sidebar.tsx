"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon, Factory } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { useLogoutMutation } from "@/store/api/auth-api"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

const data = {
    navMain: [
        {
            title: "Community",
            url: "#",
            items: [
                {
                    title: "Contribution Guide",
                    url: "#",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const router = useRouter()
    const [logout, { isLoading }] = useLogoutMutation()
    const tenant = useSelector((state: RootState) => state.auth.user.tenant)

    async function handleLogout() {
        try {
            await logout().unwrap()
        } catch {
        } finally {
            router.replace("/login")
        }
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Factory className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">{tenant}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <a href={item.url} className="font-medium">
                                        {item.title}
                                    </a>
                                </SidebarMenuButton>
                                {item.items?.length ? (
                                    <SidebarMenuSub>
                                        {item.items.map((item) => (
                                            <SidebarMenuSubItem
                                                key={item.title}
                                            >
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={item.isActive}
                                                >
                                                    <a href={item.url}>
                                                        {item.title}
                                                    </a>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                ) : null}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            disabled={isLoading}
                            tooltip="Sair"
                        >
                            <LogOutIcon />
                            <span>{isLoading ? "Saindo..." : "Sair"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
