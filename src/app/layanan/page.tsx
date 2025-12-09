'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FormEvent, useEffect, useState } from 'react';
import type { Ijenis_layanan } from '../../types/jenis_layanan';
import {createSupabaseClientForBrowser} from '@/lib/supabase';
import { Ellipsis } from "lucide-react";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const supabase = createSupabaseClientForBrowser();

const layananPage = () => {
    const [layanan, setLayanan] = useState<Ijenis_layanan[]>([]);
    const [createDialog, setCreateDialog] = useState(false);    
    const [selectedLayanan, setSelectedLayanan] = useState<{
        layanan: Ijenis_layanan;
        action: 'edit' | 'delete';
    } | null>(null);

    const formatCurrency = (v: number | string | null | undefined) => {
        if (v == null || v === '') return '-';
        const n = typeof v === 'string' ? Number(v) : v;
        if (Number.isNaN(n)) return '-';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
    };

    const fetch = async () => {
      const {data, error} = await supabase.from('jenis_layanan').select('*').order('id_jenis_layanan');  
      if (error) {
        console.log('Error', error);
      } else {
        setLayanan(data ?? []);
      }
    };

    useEffect (() => { 
        fetch();
    }, []);

    const handleAddLayanan = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Tombol ditekan, fungsi berjalan...");
        const formData = new FormData(e.currentTarget);
        try {
            const { data, error } = await supabase.from('jenis_layanan').insert(Object.fromEntries(formData)).select();
            if (error) {
                console.log('Error', error);
            } else {
                if (data) {
                    setLayanan((prev) => [...data, ...prev]);
                }
                toast('layanan berhasil ditambahkan');
                setCreateDialog(false);
            }
        } catch (error) {
            console.log('Error', error);
        }
    };

    const handleDeleteLayanan = async () => {
        if (!selectedLayanan) {
            console.log('No selected menu — abort delete');
            return;
        }
        try {
            const id = selectedLayanan.layanan.id_jenis_layanan;
            const { data, error } = await supabase.from('jenis_layanan').delete().eq('id_jenis_layanan', id);
            if (error) console.log('Error', error);
            else {
                setLayanan((prev) => prev.filter((jenis_layanan) => jenis_layanan.id_jenis_layanan !== selectedLayanan.layanan.id_jenis_layanan));
                toast('layanan berhasil dihapus');
                setSelectedLayanan(null);
            }
        } catch (err) {
            console.log('Error', err);
        }
    };

    const handleEditLayanan = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newData = Object.fromEntries(formData);
        if (!selectedLayanan?.layanan?.id_jenis_layanan) {
            console.log('No selected menu id — abort edit');
            return;
        }
        try {
            const id = selectedLayanan.layanan.id_jenis_layanan;
            const { error } = await supabase.from('jenis_layanan').update(newData).eq('id_jenis_layanan', id);
            if (error) {
                console.log('Error', error);
            } else {
                setLayanan((prev) => prev.map((jenis_layanan) => jenis_layanan.id_jenis_layanan === id ? {...jenis_layanan, ...newData} : jenis_layanan));
                toast('layanan berhasil diedit');
                setSelectedLayanan(null);
            }
        } catch (err) {
            console.log('Error', err);
        }
    };

  return (
    <div className="container mx-auto py-8">
        <div className="mb-4 w-full flex justify-between">
            <div className="text-3xl font-bold">Layanan</div>
            
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogTrigger asChild>
                    <Button className="font-bold" onClick={() => setCreateDialog(true)}>Add Layanan</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleAddLayanan} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Add Layanan</DialogTitle>
                            <DialogDescription>Tambahkan Layanan Dengan Mengisi Form Berikut</DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_jenis_layanan">ID Layanan</Label>
                                <Input id="id_jenis_layanan" name="id_jenis_layanan" placeholder="Masukkan ID Layanan" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="nama_layanan">Nama Layanan</Label>
                                <Input id="nama_layanan" name="nama_layanan" placeholder="Masukkan Nama" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="kategori">Kategori</Label>
                                <Input id="kategori" name="kategori" placeholder="Masukkan Kategori" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="harga_sekarang">Harga</Label>
                                <Input id="harga_sekarang" name="harga_sekarang" placeholder="Masukkan Harga" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Submit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>


        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-neutral-700 font-bold">ID Layanan</TableHead>
                        <TableHead className="text-neutral-700 font-bold">Nama Layanan</TableHead>
                        <TableHead className="text-neutral-700 font-bold">Kategori</TableHead>
                        <TableHead className="text-neutral-700 font-bold">Harga</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {layanan && layanan.length > 0 ? (
                    layanan.map((layanan: Ijenis_layanan) => (
                    <TableRow key={layanan.id_jenis_layanan}>
                        <TableCell>{layanan.id_jenis_layanan}</TableCell>
                        <TableCell>{layanan.nama_layanan}</TableCell>
                        <TableCell>{layanan.kategori}</TableCell>
                        <TableCell>{layanan.harga_sekarang}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="cursor-pointer">
                                    <Ellipsis />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel className="font-bold">Action</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => setSelectedLayanan({layanan, action: 'edit'})} >Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSelectedLayanan({layanan, action: 'delete'})} className="text-red-400">Delete</DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">No data available</TableCell>
                      </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>


        <Dialog open={selectedLayanan !=null && selectedLayanan.action === 'delete'} onOpenChange={(open) => {
            if (!open) {
                setSelectedLayanan(null);
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Delete Layanan</DialogTitle>
                        <DialogDescription>Apakah kamu yakin ingin menghapus layanan ini {selectedLayanan?.layanan.nama_layanan}?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleDeleteLayanan} variant="destructive" className="cursor-pointer">Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


         <Dialog open={selectedLayanan !=null && selectedLayanan.action === 'edit'} onOpenChange={(open) => {
            if (!open) {
                setSelectedLayanan(null);
            }
        }}>  
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleEditLayanan} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Edit Layanan</DialogTitle>
                            <DialogDescription>Edit Layanan Dengan Mengisi Form Berikut</DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_jenis_layanan">ID Layanan</Label>
                                <Input id="id_jenis_layanan" name="id_jenis_layanan" placeholder="Masukkan ID Layanan" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="nama_layanan">Nama Layanan</Label>
                                <Input id="nama_layanan" name="nama_layanan" placeholder="Masukkan Nama Layanan" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="kategori">Kategori</Label>
                                <Input id="kategori" name="kategori" placeholder="Masukkan Kategori" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="harga_sekarang">Harga</Label>
                                <Input id="harga_sekarang" name="harga_sekarang" placeholder="Masukkan Harga" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Submit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
export default layananPage;