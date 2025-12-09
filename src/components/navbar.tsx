import Link from "next/link";

export default function Navbar() {
    return (
        <header className="bg-gray-100 max-w-screen">
            <div className="p-4 flex items-center justify-between rounded container max-w-8xl mx-auto">
                <Link href="/" className="text-xl font-bold">Klinik Hewan CP</Link>
                <nav className="space-x-4 print:hidden">
                    <Link href="/" className="text-sm">Home</Link>
                    <Link href="/kunjungan" className="text-sm">Kunjungan</Link>
                    <Link href="/klien" className="text-sm">Klien </Link>
                    <Link href="/dokter" className="text-sm">Dokter</Link>
                    <Link href="/layanan" className="text-sm">Layanan</Link>
                    <Link href="/buku" className="text-sm">Buku Telepon</Link>
                </nav>
            </div>
        </header>
    )
}