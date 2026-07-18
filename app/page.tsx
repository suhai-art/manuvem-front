"use client"

import { useAppSelector } from "@/store/hooks"

export default function Page() {
    const { slug } = useAppSelector((state) => state.tenant)

    return <div className="grid auto-rows-min gap-4 md:grid-cols-3">{slug}</div>
}
