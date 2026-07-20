"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LogOutIcon,
    PackageIcon,
    Building2,
    Users,
    ChevronDownIcon,
    Settings,
} from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import { useLogoutMutation } from "@/store/api/auth-api"
import { useSelector } from "react-redux"
import { RootState } from "@/store"

const navItems = [
    {
        title: "Itens",
        url: "/items",
        icon: PackageIcon,
    },
    {
        title: "Clientes",
        url: "/clients",
        icon: Building2,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { setOpenMobile } = useSidebar()
    const router = useRouter()
    const pathname = usePathname()
    const [logout, { isLoading }] = useLogoutMutation()
    const tenant = useSelector((state: RootState) => state.auth.user?.tenant)

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
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                                    <img
                                        src="/manuvem_icon.png"
                                        alt="Manuvem"
                                        className="size-8 object-cover"
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-medium">
                                        {tenant ?? "Indústria"}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={
                                        pathname === item.url ||
                                        pathname.startsWith(`${item.url}/`)
                                    }
                                    tooltip={item.title}
                                >
                                    <Link
                                        href={item.url}
                                        onClick={() => {
                                            setOpenMobile(false)
                                        }}
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <Collapsible className="group">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <CollapsibleContent>
                                    <SidebarMenu className="mt-1 ml-6">
                                        {/* <SidebarMenuItem> */}
                                        {/*     <SidebarMenuButton asChild> */}
                                        {/*         <Link href="/settings/profile"> */}
                                        {/*             <User /> */}
                                        {/*             Perfil */}
                                        {/*         </Link> */}
                                        {/*     </SidebarMenuButton> */}
                                        {/* </SidebarMenuItem> */}
                                        {/**/}
                                        {/* <SidebarMenuItem> */}
                                        {/*     <SidebarMenuButton asChild> */}
                                        {/*         <Link href="/settings/company"> */}
                                        {/*             <Building2 /> */}
                                        {/*             Empresa */}
                                        {/*         </Link> */}
                                        {/*     </SidebarMenuButton> */}
                                        {/* </SidebarMenuItem> */}

                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild>
                                                <Link href="/settings/access">
                                                    <Users />
                                                    Acessos
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </SidebarMenu>
                                </CollapsibleContent>

                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton>
                                        <Settings />
                                        <span>Configurações</span>
                                        <ChevronDownIcon className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </Collapsible>
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
