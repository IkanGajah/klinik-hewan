import Link from "next/link";

export default function Navbar() {
    return (
        <header className="bg-gray-100 max-w-screen">
            <div className="p-4 flex items-center justify-between rounded container max-w-8xl mx-auto">
                <Link href="/" className="text-xl font-bold">Klinik Hewan CP</Link>
                <nav className="space-x-4">
                <Link href="/" className="text-sm">Home</Link>
                <Link href="/layanan" className="text-sm">Layanan</Link>
                <Link href="/kunjungan" className="text-sm">Kunjungan</Link>
                <Link href="/dokter" className="text-sm">Dokter</Link>
                <Link href="/klien" className="text-sm">Klien </Link>
                </nav>
            </div>
        </header>
    )
}