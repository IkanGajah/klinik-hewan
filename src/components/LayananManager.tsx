'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FormEvent, useEffect, useState } from 'react';
import { createSupabaseClientForBrowser } from '@/lib/supabase';
import { Ellipsis, Stethoscope, Plus } from "lucide-react";
import { Idetail_layanan } from "@/types/detail_layanan";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const supabase = createSupabaseClientForBrowser();

// Interface Master (Hanya Nama & Kategori, TANPA HARGA)
interface IMasterLayanan {
    id_jenis_layanan: string;
    nama_layanan: string;
    kategori: string;
}

// Interface Detail (Transaksi)
interface IDetailLayanan {
    id_detail_layanan: string;
    id_kunjungan: string;
    id_jenis_layanan: string;
    harga_saat_layanan: number; // Harga diinput manual saat transaksi
    jenis_layanan?: IMasterLayanan;
}

const LayananManager = ({ idKunjungan }: { idKunjungan: string | number }) => {
    const router = useRouter();
    const [detail, setDetail ] = useState<Idetail_layanan | null>(null);
    const [listDetail, setListDetail] = useState<IDetailLayanan[]>([]);
    const [masterLayanan, setMasterLayanan] = useState<IMasterLayanan[]>([]);
    
    const [createDialog, setCreateDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{
        data: IDetailLayanan;
        action: 'edit' | 'delete';
    } | null>(null);

    const formatIDR = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(amount));
    };

    // 1. Fetch Master Data
    const fetchMaster = async () => {
        // Ambil data master layanan untuk dropdown
        const { data } = await supabase.from('jenis_layanan').select('*').order('nama_layanan');
        if (data) setMasterLayanan(data);
    }

    // 2. Fetch Detail Transaksi
    const fetchDetail = async () => {
        const { data, error } = await supabase
            .from('detail_layanan')
            .select(`
                *,
                jenis_layanan (nama_layanan, kategori)
            `)
            .eq('id_kunjungan', idKunjungan);
        
        if (error) console.log(error);
        else setListDetail(data as any[] ?? []);
    };

    useEffect(() => {
        fetchMaster();
        if (idKunjungan) fetchDetail();
    }, [idKunjungan]);

    // --- CRUD ---

    const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append('id_kunjungan', String(idKunjungan));
        
        // Harga diambil otomatis dari input manual user (<Input name="harga_saat_layanan">)

        try {
            const { error } = await supabase.from('detail_layanan').insert(Object.fromEntries(formData));
            if (!error) {
                toast('Layanan berhasil ditambahkan');
                setCreateDialog(false);
                fetchDetail();
                router.refresh(); 
                window.dispatchEvent(new Event('update-tagihan'));
            } else {
                toast('Gagal menambah layanan');
                console.log(error);
            }
        } catch (err) { console.log(err) }
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        const { error } = await supabase.from('detail_layanan').delete().eq('id_detail_layanan', selectedItem.data.id_detail_layanan);
        if (!error) {
            toast('Layanan dihapus');
            setListDetail(prev => prev.filter(item => item.id_detail_layanan !== selectedItem.data.id_detail_layanan));
            setSelectedItem(null);
            router.refresh();
            window.dispatchEvent(new Event('update-tagihan'));
        }
    };

    const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedItem) return;
        const formData = new FormData(e.currentTarget);
        const newData = Object.fromEntries(formData);
        
        const { error } = await supabase.from('detail_layanan').update(newData).eq('id_detail_layanan', selectedItem.data.id_detail_layanan);
        if (!error) {
            toast('Layanan diupdate');
            fetchDetail();
            setSelectedItem(null);
            router.refresh();
            window.dispatchEvent(new Event('update-tagihan'));
        }
    };

    return (
        <div className="w-full py-6">
            <div className="mb-4 w-full flex justify-between items-center">
                <div className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Stethoscope className="w-6 h-6 text-blue-500" />
                    Input Tindakan & Layanan
                </div>

                <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="font-bold bg-blue-600 hover:bg-blue-700 print:hidden">
                            <Plus className="w-4 h-4 mr-2"/> Tambah Layanan
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleAdd} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle>Tambah Layanan</DialogTitle>
                            </DialogHeader>
                            <div className="grid w-full gap-4">
                                <div className="grid w-full gap-1.5">
                                    <Label>ID Detail Layanan</Label>
                                    <Input name="id_detail_layanan" placeholder="Masukkan ID Layanan" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label>Jenis Layanan</Label>
                                    <Select name="id_jenis_layanan" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Layanan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterLayanan.map((m) => (
                                                <SelectItem key={m.id_jenis_layanan} value={String(m.id_jenis_layanan)}>
                                                    {m.nama_layanan} <span className="text-gray-400 text-xs">({m.kategori})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid w-full gap-1.5">
                                    <Label>Harga (Rp)</Label>
                                    <Input 
                                        name="harga_saat_layanan" 
                                        type="number" 
                                        placeholder="Masukkan harga..." 
                                        required 
                                    />
                                    <p className="text-xs text-gray-400">
                                        *Wajib diisi manual sesuai tarif dokter.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Simpan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* TABEL DATA */}
            <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-blue-50">
                        <TableRow>
                            <TableHead className="font-bold text-gray-700">ID Layanan</TableHead>
                            <TableHead className="font-bold text-gray-700">Nama Layanan</TableHead>
                            <TableHead className="font-bold text-gray-700">Kategori</TableHead>
                            <TableHead className="font-bold text-gray-700">Harga</TableHead>
                            <TableHead className="text-center print:hidden"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {listDetail.length > 0 ? (
                            listDetail.map((item) => (
                                <TableRow key={item.id_detail_layanan}>
                                    <TableCell>{item.id_detail_layanan}</TableCell>
                                    <TableCell>{item.jenis_layanan?.nama_layanan}</TableCell>
                                    <TableCell>{item.jenis_layanan?.kategori}</TableCell>
                                    <TableCell>{formatIDR(item.harga_saat_layanan)}</TableCell>
                                    <TableCell className="text-center print:hidden">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="cursor-pointer items-center">
                                                <Ellipsis className="w-4 h-4 text-gray-500" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setSelectedItem({ data: item, action: 'edit' })}>Edit Harga</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setSelectedItem({ data: item, action: 'delete' })} className="text-red-500">Hapus</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-400 italic">
                                    Belum ada layanan/tindakan yang dimasukkan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* DIALOG DELETE */}
             <Dialog open={selectedItem != null && selectedItem.action === 'delete'} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Hapus Layanan?</DialogTitle></DialogHeader>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG EDIT */}
            <Dialog open={selectedItem != null && selectedItem.action === 'edit'} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <DialogHeader><DialogTitle>Edit Layanan</DialogTitle></DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label>Harga (Rp)</Label>
                                <Input name="harga_saat_layanan" type="number" defaultValue={selectedItem?.data.harga_saat_layanan} required />
                            </div>
                        </div>
                        <DialogFooter><Button type="submit">Update</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default LayananManager;