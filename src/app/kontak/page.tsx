'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseClientForBrowser } from '@/lib/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, Stethoscope, RefreshCcw } from "lucide-react";

// Inisialisasi Supabase Client
const supabase = createSupabaseClientForBrowser();

// Tipe Data Gabungan (Standarisasi)
interface IContact {
  id_unik: string;      // ID gabungan string (misal: "dok-1") untuk Key React
  id_asli: number | string;
  nama: string;
  telepon: string;
  tipe: 'Pemilik' | 'Dokter';
}

export default function KontakPage() {
  // State
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<IContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fungsi Fetch & Union Data
  const fetchContacts = async () => {
    setLoading(true);
    try {
      // 1. Ambil data PEMILIK dan DOKTER secara bersamaan (Parallel Fetching)
      const [resPemilik, resDokter] = await Promise.all([
        supabase.from('pemilik').select('id_pemilik, nama_pemilik, nomor_telepon'),
        supabase.from('dokter').select('id_dokter, nama_dokter, no_telepon') // Asumsi kolom dokter 'no_telepon'
      ]);

      if (resPemilik.error) throw resPemilik.error;
      if (resDokter.error) throw resDokter.error;

      // 2. Normalisasi Data Pemilik
      const listPemilik: IContact[] = (resPemilik.data || []).map((p: any) => ({
        id_unik: `pem-${p.id_pemilik}`,
        id_asli: p.id_pemilik,
        nama: p.nama_pemilik,
        telepon: p.nomor_telepon || '-',
        tipe: 'Pemilik'
      }));

      // 3. Normalisasi Data Dokter
      const listDokter: IContact[] = (resDokter.data || []).map((d: any) => ({
        id_unik: `dok-${d.id_dokter}`,
        id_asli: d.id_dokter,
        nama: d.nama_dokter,
        telepon: d.no_telepon || '-', // Jika dokter belum ada no_telepon di DB, dia akan '-'
        tipe: 'Dokter'
      }));

      // 4. UNION (Gabungkan array) & SORTING (Urutkan A-Z)
      const gabungan = [...listDokter, ...listPemilik].sort((a, b) => 
        a.nama.localeCompare(b.nama)
      );

      setContacts(gabungan);
      setFilteredContacts(gabungan);

    } catch (error) {
      console.error("Gagal mengambil data kontak:", error);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetch saat halaman dibuka
  useEffect(() => {
    fetchContacts();
  }, []);

  // Logic Search Real-time
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredContacts(contacts);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const hasil = contacts.filter(c => 
        c.nama.toLowerCase().includes(lowerSearch) || 
        c.telepon.includes(searchTerm)
      );
      setFilteredContacts(hasil);
    }
  }, [searchTerm, contacts]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Buku Telepon</h1>
          <p className="text-gray-500 text-sm">Database kontak gabungan Klien dan Dokter.</p>
      </div>
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
            placeholder="Cari nama atau no. telp..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-1/3"></div>
          <Button variant="outline" onClick={fetchContacts} disabled={loading}>
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
          </Button>
        </div>

        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bold text-neutral-700"></TableHead>
                        <TableHead className="font-bold text-neutral-700">Nama Lengkap</TableHead>
                        <TableHead className="font-bold text-neutral-700">Nomor Telepon</TableHead>
                        <TableHead className="font-bold text-neutral-700 text-center">Status</TableHead>
                        <TableHead className="font-bold text-neutral-700">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500 animate-pulse">
                                Memuat data kontak...
                            </TableCell>
                        </TableRow>
                    ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((item, index) => (
                            <TableRow key={item.id_unik}>
                                <TableCell className="text-gray-400 text-xs">{index + 1}</TableCell>                                
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        {item.tipe === 'Dokter' ? (
                                            <div className="p-2 bg-green-100 rounded-full text-green-600">
                                                <Stethoscope className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                        {item.nama}
                                    </div>
                                </TableCell>
                                
                                <TableCell>
                                    <div className="flex items-center gap-2 text-gray-600 font-mono text-sm">
                                        {item.telepon}
                                    </div>
                                </TableCell>
                                
                                <TableCell className="text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                        item.tipe === 'Dokter' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                        {item.tipe}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <Link 
                                        href={`https://wa.me/${item.telepon.replace(/^0/, '62').replace(/\D/g,'')}`} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-center font-semibold text-green-600 hover:text-green-800 hover:underline justify-end gap-1"
                                    >
                                        Chat WA
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-gray-400 italic">
                                Tidak ada kontak yang cocok dengan "{searchTerm}".
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
        
        <div className="text-center text-xs text-gray-400">
            Menampilkan {filteredContacts.length} dari total {contacts.length} kontak.
        </div>

      </div>
    </div>
  );
}