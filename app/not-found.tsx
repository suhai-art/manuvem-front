import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="flex min-h-full flex-col items-center justify-center gap-6 p-0">
            <Image
                src="/manuvem_fulllogo.png"
                alt="Página não encontrada"
                width={400}
                height={400}
                priority
            />

            <h1 className="text-5xl font-bold">404</h1>

            <p className="text-lg text-muted-foreground">
                Ops! A página que você procura não existe.
            </p>
        </div>
    )
}
