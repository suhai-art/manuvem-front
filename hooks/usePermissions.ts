import { useSelector } from "react-redux"
import { RootState } from "@/store"

export function usePermission() {
    const permissions = useSelector(
        (state: RootState) => state.auth.user?.permissions ?? []
    )

    function can(permission: string) {
        if (permissions.includes("*")) {
            return true
        }
        return permissions.includes(permission)
    }

    return {
        permissions,
        can,
    }
}
