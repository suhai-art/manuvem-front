import { useSidebar } from "@/components/ui/sidebar"

export default function HeaderLogo() {
    const { state, isMobile } = useSidebar()

    return isMobile || state === "collapsed" ? (
        <div className="ml-auto flex items-center px-3">
            <img src="/manuvem_icon.png" alt="Manuvem" className="h-8 w-auto" />
        </div>
    ) : null
}
