'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FormEvent, useEffect, useState } from 'react';
import { createSupabaseClientForBrowser } from '@/lib/supabase';
import { Ellipsis } from "lucide-react";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const supabase = createSupabaseClientForBrowser();

// Definisikan Tipe Data Hewan
interface IHewan {
    id_hewan: number | string;
    id_pemilik: string;
    nama: string;
    jenis: string;
    ras: string;
    jenis_kelamin: string;
    tanggal_lahir?: string;
}

const HewanManager = ({ idPemilik }: { idPemilik: string }) => {
    const [hewanList, setHewanList] = useState<IHewan[]>([]);
    const [createDialog, setCreateDialog] = useState(false);
    
    // State untuk Edit dan Delete
    const [selectedHewan, setSelectedHewan] = useState<{
        data: IHewan;
        action: 'edit' | 'delete';
    } | null>(null);

    // Fetch Data Hewan berdasarkan ID Pemilik
    const fetchHewan = async () => {
        const { data, error } = await supabase
            .from('hewan') // Pastikan nama tabel di DB (huruf kecil/besar sesuaikan)
            .select('*')
            .eq('id_pemilik', idPemilik)
            .order('id_hewan', { ascending: true });

        if (error) {
            console.log('Error fetching hewan', error);
        } else {
            setHewanList(data ?? []);
        }
    };

    useEffect(() => {
        if (idPemilik) {
            fetchHewan();
        }
    }, [idPemilik]);

    // Handle Tambah Hewan
    const handleAddHewan = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Tambahkan id_pemilik secara manual ke data yang akan dikirim
        formData.append('id_pemilik', idPemilik);

        try {
            const { data, error } = await supabase.from('hewan').insert(Object.fromEntries(formData)).select();
            if (error) {
                console.log('Error menambah hewan', error);
                toast('Gagal menambahkan hewan');
            } else {
                if (data) {
                    setHewanList((prev) => [...prev, ...data]);
                }
                toast('Hewan berhasil ditambahkan');
                setCreateDialog(false);
            }
        } catch (error) {
            console.log('Error', error);
        }
    };

    // Handle Hapus Hewan
    const handleDeleteHewan = async () => {
        if (!selectedHewan) return;

        try {
            const id = selectedHewan.data.id_hewan;
            const { error } = await supabase.from('hewan').delete().eq('id_hewan', id);
            
            if (error) {
                console.log('Error deleting', error);
            } else {
                setHewanList((prev) => prev.filter((h) => h.id_hewan !== id));
                toast('Hewan berhasil dihapus');
                setSelectedHewan(null);
            }
        } catch (err) {
            console.log('Error', err);
        }
    };

    // Handle Edit Hewan
    const handleEditHewan = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedHewan?.data?.id_hewan) return;

        const formData = new FormData(e.currentTarget);
        const newData = Object.fromEntries(formData);
        const id = selectedHewan.data.id_hewan;

        try {
            const { error } = await supabase.from('hewan').update(newData).eq('id_hewan', id);
            
            if (error) {
                console.log('Error updating', error);
            } else {
                setHewanList((prev) => prev.map((h) => h.id_hewan === id ? { ...h, ...newData, id_hewan: id, id_pemilik: idPemilik } : h));
                toast('Hewan berhasil diedit');
                setSelectedHewan(null);
            }
        } catch (err) {
            console.log('Error', err);
        }
    };

    return (
        <div className="py-8 w-full">
            <div className="mb-4 w-full flex justify-between items-center">
                <div className="text-2xl font-bold">Daftar Peliharaan</div>

                <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="font-bold" onClick={() => setCreateDialog(true)}>Add Hewan</Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleAddHewan} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Add Hewan</DialogTitle>
                                <DialogDescription>Tambahkan Hewan Baru</DialogDescription>
                            </DialogHeader>
                            <div className="grid w-full gap-4">
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="id_hewan">ID Hewan</Label>
                                    <Input id="id_hewan" name="id_hewan" placeholder="Contoh: H007" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="nama">Nama Hewan</Label>
                                    <Input id="nama" name="nama" placeholder="Contoh: Mochi" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="jenis">Jenis</Label>
                                    <Input id="jenis" name="jenis" placeholder="Contoh: Kucing" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="ras">Ras</Label>
                                    <Input id="ras" name="ras" placeholder="Contoh: Persia" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="jenis_kelamin">Gender</Label>
                                    <select 
                                        id="jenis_kelamin" 
                                        name="jenis_kelamin" 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        required
                                    >
                                        <option value="Jantan">Jantan</option>
                                        <option value="Betina">Betina</option>
                                    </select>
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                                    <Input id="tanggal_lahir" name="tanggal_lahir" type="date" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Tambahkan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* TABEL */}
            <div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-neutral-700 font-bold">ID Hewan</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Nama</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Jenis</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Ras</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Gender</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {hewanList && hewanList.length > 0 ? (
                            hewanList.map((hewan) => (
                                <TableRow key={hewan.id_hewan}>
                                    <TableCell>{hewan.id_hewan}</TableCell>
                                    <TableCell>{hewan.nama}</TableCell>
                                    <TableCell>{hewan.jenis}</TableCell>
                                    <TableCell>{hewan.ras}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded text-xs text-white ${hewan.jenis_kelamin === 'Jantan' ? 'bg-blue-400' : 'bg-pink-400'}`}>
                                            {hewan.jenis_kelamin}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="cursor-pointer">
                                                <Ellipsis className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel className="font-bold">Action</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem onClick={() => setSelectedHewan({ data: hewan, action: 'edit' })}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSelectedHewan({ data: hewan, action: 'delete' })} className="text-red-400">Delete</DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-gray-500">Belum ada hewan terdaftar</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={selectedHewan != null && selectedHewan.action === 'delete'} onOpenChange={(open) => {
                if (!open) setSelectedHewan(null);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Delete Hewan</DialogTitle>
                        <DialogDescription>Apakah kamu yakin ingin menghapus {selectedHewan?.data.nama}?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleDeleteHewan} variant="destructive" className="cursor-pointer">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={selectedHewan != null && selectedHewan.action === 'edit'} onOpenChange={(open) => {
                if (!open) setSelectedHewan(null);
            }}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleEditHewan} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Edit Hewan</DialogTitle>
                            <DialogDescription>Edit Data Hewan</DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="edit_id">ID Hewan</Label>
                                <Input id="edit_id" name="id_hewan" defaultValue={selectedHewan?.data.id_hewan} required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="edit_nama">Nama Hewan</Label>
                                <Input id="edit_nama" name="nama" defaultValue={selectedHewan?.data.nama} required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="edit_jenis">Jenis</Label>
                                <Input id="edit_jenis" name="jenis" defaultValue={selectedHewan?.data.jenis} required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="edit_ras">Ras</Label>
                                <Input id="edit_ras" name="ras" defaultValue={selectedHewan?.data.ras} required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="edit_jenis_kelamin">Gender</Label>
                                <select 
                                    id="edit_jenis_kelamin" 
                                    name="jenis_kelamin" 
                                    defaultValue={selectedHewan?.data.jenis_kelamin}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="Jantan">Jantan</option>
                                    <option value="Betina">Betina</option>
                                </select>
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="edit_tanggal_lahir">Tanggal Lahir</Label>
                                <Input 
                                    id="edit_tanggal_lahir" 
                                    name="tanggal_lahir" 
                                    type="date" 
                                    defaultValue={selectedHewan?.data.tanggal_lahir ? new Date(selectedHewan.data.tanggal_lahir).toISOString().split('T')[0] : ''} 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HewanManager;