import { useSelector } from "react-redux"
import { RootState } from "@/store"

export function usePermission() {
    const permissions = useSelector(
        (state: RootState) => state.auth.user?.permissions ?? []
    )

    function can(permission: string) {
        console.log(permissions.includes("*"))
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
