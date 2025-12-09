'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FormEvent, useEffect, useState } from 'react';
import { createSupabaseClientForBrowser } from '@/lib/supabase';
import { Ellipsis, Printer, Receipt, CreditCard } from "lucide-react";
import { DropdownMenuItem, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import type { Ipembayaran } from '@/types/pembayaran';

const supabase = createSupabaseClientForBrowser();

// Tipe data untuk Item Layanan (Detail Tagihan)
interface IDetailItem {
    id_detail_layanan: number;
    harga_saat_layanan: number;
    jenis_layanan: {
        nama_layanan: string;
        kategori: string;
    };
}

const PembayaranManager = ({ idKunjungan }: { idKunjungan: string | number }) => {
    // State untuk Pembayaran (Transaksi)
    const [pembayaranList, setPembayaranList] = useState<Ipembayaran[]>([]);
    // State untuk Detail Layanan (Tagihan)
    const [tagihanList, setTagihanList] = useState<IDetailItem[]>([]);
    
    const [createDialog, setCreateDialog] = useState(false);
    const [selectedPembayaran, setSelectedPembayaran] = useState<{
        data: Ipembayaran;
        action: 'edit' | 'delete';
    } | null>(null);

    // Formatter Rupiah
    const formatIDR = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(amount));
    };

    // 1. Fetch Daftar Item Layanan (Apa saja yang harus dibayar?)
    const fetchTagihan = async () => {
        const { data, error } = await supabase
            .from('detail_layanan') // Pastikan nama tabel benar (kecil/besar)
            .select(`
                id_detail_layanan,
                harga_saat_layanan,
                jenis_layanan (nama_layanan, kategori)
            `)
            .eq('id_kunjungan', idKunjungan);

        if (error) console.log('Error fetch tagihan', error);
        else setTagihanList(data as any[] ?? []);
    };

    // 2. Fetch Riwayat Pembayaran (Apa saja yang sudah dibayar?)
    const fetchPembayaran = async () => {
        const { data, error } = await supabase
            .from('pembayaran')
            .select('*')
            .eq('id_kunjungan', idKunjungan);

        if (error) console.log('Error fetch pembayaran', error);
        else setPembayaranList(data ?? []);
    };

    useEffect(() => {
        if (idKunjungan) {
            fetchTagihan();
            fetchPembayaran();
        }

        const handleUpdateSinyal = () => {
            console.log("Sinyal update diterima, refresh tagihan...");
            fetchTagihan();
            fetchPembayaran();
        };

        window.addEventListener('update-tagihan', handleUpdateSinyal);
        return () => {
            window.removeEventListener('update-tagihan', handleUpdateSinyal);
        };
    }, [idKunjungan]);

    // Hitung Total
    const totalTagihanSeharusnya = tagihanList.reduce((acc, item) => acc + Number(item.harga_saat_layanan), 0);
    const totalSudahDibayar = pembayaranList.reduce((acc, item) => acc + Number(item.total_tagihan), 0);
    const sisaTagihan = totalTagihanSeharusnya - totalSudahDibayar;

    // --- CRUD PEMBAYARAN (Sama seperti sebelumnya) ---
    const handleAddPembayaran = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append('id_kunjungan', String(idKunjungan));

        try {
            const { data, error } = await supabase.from('pembayaran').insert(Object.fromEntries(formData)).select();
            if (error) {
                toast('Gagal menambah pembayaran');
            } else {
                if (data) setPembayaranList((prev) => [...prev, ...data]);
                toast('Pembayaran berhasil ditambahkan');
                setCreateDialog(false);
            }
        } catch (error) { console.log(error) }
    };

    const handleDeletePembayaran = async () => {
        if (!selectedPembayaran) return;
        try {
            const { error } = await supabase.from('pembayaran').delete().eq('id_pembayaran', selectedPembayaran.data.id_pembayaran);
            if (!error) {
                setPembayaranList((prev) => prev.filter((p) => p.id_pembayaran !== selectedPembayaran.data.id_pembayaran));
                toast('Pembayaran dihapus');
                setSelectedPembayaran(null);
            }
        } catch (err) { console.log(err) }
    };

    const handleEditPembayaran = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedPembayaran) return;
        const formData = new FormData(e.currentTarget);
        const newData = Object.fromEntries(formData);
        try {
            const { error } = await supabase.from('pembayaran').update(newData).eq('id_pembayaran', selectedPembayaran.data.id_pembayaran);
            if (!error) {
                setPembayaranList((prev) => prev.map((p) => p.id_pembayaran === selectedPembayaran.data.id_pembayaran ? { ...p, ...newData } : p));
                toast('Pembayaran diperbarui');
                setSelectedPembayaran(null);
            }
        } catch (err) { console.log(err) }
    };

    const handlePrint = () => window.print();

    return (
        <div className="w-full py-6 space-y-8">
            <div>
                <div className="flex items-center gap-2 mb-4 text-neutral-800">
                    <Receipt className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold">Rincian Layanan & Obat</h2>
                </div>
                
                <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                        <TableHeader className="bg-orange-50">
                            <TableRow>
                                <TableHead className="font-bold text-neutral-700">Nama Layanan</TableHead>
                                <TableHead className="font-bold text-neutral-700">Kategori</TableHead>
                                <TableHead className="text-right font-bold text-neutral-700">Harga</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tagihanList.length > 0 ? (
                                tagihanList.map((item) => (
                                    <TableRow key={item.id_detail_layanan}>
                                        <TableCell>{item.jenis_layanan?.nama_layanan}</TableCell>
                                        <TableCell>{item.jenis_layanan?.kategori}</TableCell>
                                        <TableCell className="text-right font-mono text-gray-700">
                                            {formatIDR(item.harga_saat_layanan)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-6 text-gray-400 italic">
                                        Belum ada layanan yang diinput dokter.
                                    </TableCell>
                                </TableRow>
                            )}
                            
                            {/* Baris Total Tagihan */}
                            <TableRow className="bg-gray-50 font-bold border-t-2">
                                <TableCell colSpan={2} className="text-right">TOTAL TAGIHAN:</TableCell>
                                <TableCell className="text-right text-lg text-orange-600">
                                    {formatIDR(totalTagihanSeharusnya)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-gray-800">
                        <CreditCard className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-bold">Riwayat Pembayaran</h2>
                    </div>

                    <div className="flex gap-2 print:hidden">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2"/> Cetak Invoice
                        </Button>

                        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                            <DialogTrigger asChild>
                                <Button className="font-bold bg-green-600 hover:bg-green-700">
                                    + Bayar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <form onSubmit={handleAddPembayaran} className="space-y-4">
                                    <DialogHeader>
                                        <DialogTitle>Input Pembayaran</DialogTitle>
                                        <DialogDescription>
                                            Sisa yang harus dibayar: <span className="font-bold text-red-500">{formatIDR(sisaTagihan)}</span>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid w-full gap-4">
                                        <div className="grid w-full gap-1.5">
                                            <Label>ID Pembayaran</Label>
                                            <Input name="id_pembayaran" type="string" defaultValue={'PM000'} required />
                                        </div>
                                        <div className="grid w-full gap-1.5">
                                            <Label>Nominal Bayar (Rp)</Label>
                                            <Input name="total_tagihan" type="number" defaultValue={sisaTagihan > 0 ? sisaTagihan : ''} required />
                                        </div>
                                        <div className="grid w-full gap-1.5">
                                            <Label>Tanggal</Label>
                                            <Input name="tanggal_pembayaran" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                                        </div>
                                        <div className="grid w-full gap-1.5">
                                            <Label>Metode</Label>
                                            <Select name="metode_pembayaran" required defaultValue="Tunai">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Tunai">Tunai</SelectItem>
                                                    <SelectItem value="Debit">Debit</SelectItem>
                                                    <SelectItem value="QRIS">QRIS</SelectItem>
                                                    <SelectItem value="Transfer">Transfer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid w-full gap-1.5">
                                            <Label>Status</Label>
                                            <Select name="status" required defaultValue="Lunas">
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Lunas">Lunas</SelectItem>
                                                    <SelectItem value="Pending">Belum Lunas</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Simpan Pembayaran</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="rounded-md border bg-white overflow-hidden">
                    <Table>
                        <TableHeader className="bg-green-50">
                            <TableRow>
                                <TableHead className="font-bold text-gray-700 print:hidden">ID Pembayaran</TableHead>
                                <TableHead className="font-bold text-gray-700">Tanggal</TableHead>
                                <TableHead className="font-bold text-gray-700">Metode</TableHead>
                                <TableHead className="font-bold text-gray-700">Status</TableHead>
                                <TableHead className="print:text-right text-left font-bold text-gray-700">Nominal</TableHead>
                                <TableHead className="text-center print:hidden"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pembayaranList.length > 0 ? (
                                pembayaranList.map((p) => (
                                    <TableRow key={p.id_pembayaran}>
                                        <TableCell className="print:hidden">{p.id_pembayaran}</TableCell>
                                        <TableCell>{new Date(p.tanggal_pembayaran).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell>{p.metode_pembayaran}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs text-white ${p.status === 'Lunas' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                                {p.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="print:text-right text-left font-mono font-bold text-green-700">
                                            {formatIDR(p.total_tagihan)}
                                        </TableCell>
                                        <TableCell className="text-center print:hidden">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild className="cursor-pointer">
                                                    <Ellipsis className="w-4 h-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => setSelectedPembayaran({ data: p, action: 'edit' })}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSelectedPembayaran({ data: p, action: 'delete' })} className="text-red-500">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-gray-400 italic">
                                        Belum ada pembayaran masuk.
                                    </TableCell>
                                </TableRow>
                            )}
                            
                            {/* Status Lunas/Belum */}
                            <TableRow className="bg-gray-50 border-t-2 font-bold">
                                <TableCell colSpan={3} className="text-right">SISA TAGIHAN:</TableCell>
                                <TableCell className={`text-right text-lg ${sisaTagihan > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {sisaTagihan <= 0 ? 'LUNAS' : formatIDR(sisaTagihan)}
                                </TableCell>
                                <TableCell className="print:hidden"></TableCell>
                                <TableCell className="print:hidden"></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* --- DIALOG EDIT & DELETE (Sama seperti sebelumnya, disembunyikan di bawah) --- */}
            {/* (Dialog Delete & Edit tidak saya ubah, gunakan kode yang ada sebelumnya di bagian bawah) */}
            <Dialog open={selectedPembayaran != null && selectedPembayaran.action === 'delete'} onOpenChange={(open) => !open && setSelectedPembayaran(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Pembayaran?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleDeletePembayaran}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={selectedPembayaran != null && selectedPembayaran.action === 'edit'} onOpenChange={(open) => !open && setSelectedPembayaran(null)}>
                <DialogContent>
                    <form onSubmit={handleEditPembayaran} className="space-y-4">
                        <DialogHeader><DialogTitle>Edit Pembayaran</DialogTitle></DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label>Nominal</Label>
                                <Input name="total_tagihan" type="number" defaultValue={selectedPembayaran?.data.total_tagihan} required />
                            </div>
                        </div>
                        <DialogFooter><Button type="submit">Update</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default PembayaranManager;