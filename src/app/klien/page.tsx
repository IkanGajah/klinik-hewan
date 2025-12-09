'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState, useEffect, FormEvent } from "react"
import type { Ipemilik } from '@/types/pemilik';
import {createSupabaseClientForBrowser} from '@/lib/supabase';
import { Ellipsis } from "lucide-react";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from 'next/link';

const supabase = createSupabaseClientForBrowser();

const pemilikPage = () => {
    const [createDialog, setCreateDialog] = useState(false);
    const [pemilik, setPemilik] = useState<Ipemilik[]>([]);
    const [selectedPemilik, setSelectedPemilik] = useState<{
        pemilik: Ipemilik;
        action: 'edit' | 'delete';
    } | null>(null);
    const [editForm, setEditForm] = useState({
        id_pemilik: '',
        nama_pemilik: '',
        alamat: '',
        nomor_telepon: ''
    });

    const fetchMenu = async () => {
          const {data, error} = await supabase.from('pemilik').select('*').order('id_pemilik');  
          if (error) {
            console.log('Error', error);
          } else {
            setPemilik(data ?? []);
          }
        };
    
    useEffect (() => { 
        fetchMenu();
        if (selectedPemilik?.action === 'edit' && selectedPemilik.pemilik) {
            setEditForm({
                id_pemilik: selectedPemilik.pemilik.id_pemilik ?? '',
                nama_pemilik: selectedPemilik.pemilik.nama_pemilik ?? '',
                alamat: selectedPemilik.pemilik.alamat ?? '',
                nomor_telepon: selectedPemilik.pemilik.nomor_telepon ?? ''
            });
        } else {
           setEditForm({ id_pemilik: '', nama_pemilik: '', alamat: '', nomor_telepon: '' });
        }
    }, [selectedPemilik]);

    const handleAddPemilik = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Tombol ditekan, fungsi berjalan...");
        const formData = new FormData(e.currentTarget);
        try {
            const { data, error } = await supabase.from('pemilik').insert(Object.fromEntries(formData)).select();
            if (error) {
                console.log('Error', error);
            } else {
                if (data) {
                    setPemilik((prev) => [...data, ...prev]);
                }
                toast('dokter berhasil ditambahkan');
                setCreateDialog(false);
                fetchMenu();
            }
        } catch (error) {
            console.log('Error', error);
        }
    };

    const handleDeletePemilik = async () => {
        if (!selectedPemilik) {
            console.log('No selected menu — abort delete');
            return;
        }
        try {
            const id = selectedPemilik.pemilik.id_pemilik;
            const { data, error } = await supabase.from('pemilik').delete().eq('id_pemilik', id);
            if (error) console.log('Error', error);
            else {
                setPemilik((prev) => prev.filter((pemilik) => pemilik.id_pemilik !== selectedPemilik.pemilik.id_pemilik));
                toast('pemilik berhasil dihapus');
                setSelectedPemilik(null);
                fetchMenu();
            }
        } catch (err) {
            console.log('Error', err);
        }
        fetchMenu();
    };

    const handleEditPemilik = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newData = Object.fromEntries(formData);
        if (!selectedPemilik?.pemilik?.id_pemilik) {
            console.log('No selected menu id — abort edit');
            return;
        }
        try {
            const id = selectedPemilik.pemilik.id_pemilik;
            const { error } = await supabase.from('pemilik').update(newData).eq('id_pemilik', id);
            if (error) {
                console.log('Error', error);
            } else {
                setPemilik((prev) => prev.map((pemilik) => pemilik.id_pemilik === id ? {...pemilik, ...newData} : pemilik));
                toast('pemilik berhasil diedit');
                setSelectedPemilik(null);
                fetchMenu();
            }
        } catch (err) {
            console.log('Error', err);
        }
        fetchMenu();
    };
    

  return (
    <div className="container mx-auto py-8">
        <div className="mb-4 w-full flex justify-between">
            <div className="text-3xl font-bold">Pemilik</div>
            
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogTrigger asChild>
                    <Button className="font-bold" onClick={() => setCreateDialog(true)}>Add Pemilik</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleAddPemilik} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Add Pemilik</DialogTitle>
                            <DialogDescription>Tambahkan Pemilik Dengan Mengisi Form Berikut</DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_pemilik">ID Pemilik</Label>
                                <Input id="id_pemilik" name="id_pemilik" placeholder="Masukkan ID Pemilik" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="nama_pemilik">Nama</Label>
                                <Input id="nama_pemilik" name="nama_pemilik" placeholder="Masukkan Nama" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="alamat">Alamat</Label>
                                <Input id="alamat" name="alamat" placeholder="Masukkan Alamat" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                                <Input id="nomor_telepon" name="nomor_telepon" placeholder="Masukkan Nomor Telepon" required />
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
                <TableHead className="text-neutral-700 font-bold">ID Pemilik</TableHead>
                <TableHead className="text-neutral-700 font-bold">Nama Pemilik</TableHead>
                <TableHead className="text-neutral-700 font-bold">Alamat</TableHead>
                <TableHead className="text-neutral-700 font-bold">Nomor Telepon</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pemilik.map((p) => (
                <TableRow key={p.id_pemilik} className="hover:bg-gray-50">
                    <TableCell>{p.id_pemilik}</TableCell>
                    <TableCell>{p.nama_pemilik}</TableCell>
                    <TableCell>{p.alamat}</TableCell>
                    <TableCell>{p.nomor_telepon}</TableCell>
                    <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="cursor-pointer">
                                    <Ellipsis />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel className="font-bold">Action</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                            <Link href={`/klien/${p.id_pemilik}`} className="w-full block">
                                                Lihat Hewan
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSelectedPemilik({pemilik : p, action: 'edit'})} >Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSelectedPemilik({pemilik : p, action: 'delete'})} className="text-red-400">Delete</DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>

        <Dialog open={selectedPemilik !=null && selectedPemilik.action === 'delete'} onOpenChange={(open) => {
            if (!open) {
                setSelectedPemilik(null);
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Delete Pemilik</DialogTitle>
                        <DialogDescription>Apakah kamu yakin ingin menghapus pemilik ini {selectedPemilik?.pemilik.nama_pemilik}?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleDeletePemilik} variant="destructive" className="cursor-pointer">Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <Dialog open={selectedPemilik !=null && selectedPemilik.action === 'edit'} onOpenChange={(open) => {
            if (!open) {
                setSelectedPemilik(null);
            }
        }}>  
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleEditPemilik} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Edit Pemilik</DialogTitle>
                            <DialogDescription>Edit Pemilik Dengan Mengisi Form Berikut</DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_pemilik">ID Pemilik</Label>
                                <Input id="id_pemilik" name="id_pemilik" value={editForm.id_pemilik} onChange={(e) => setEditForm({...editForm, id_pemilik: e.target.value})} placeholder="Masukkan ID Pemilik" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="nama_pemilik">Nama Pemilik</Label>
                                <Input id="nama_pemilik" name="nama_pemilik" value={editForm.nama_pemilik} onChange={(e) => setEditForm({...editForm, nama_pemilik: e.target.value})} placeholder="Masukkan Nama Pemilik" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="alamat">Alamat</Label>
                                <Input id="alamat" name="alamat" value={editForm.alamat} onChange={(e) => setEditForm({...editForm, alamat: e.target.value})} placeholder="Masukkan Alamat" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                                <Input id="nomor_telepon" name="nomor_telepon" value={editForm.nomor_telepon} onChange={(e) => setEditForm({...editForm, nomor_telepon: e.target.value})} placeholder="Masukkan Nomor Telepon" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Submit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
    </div>
  );
}
export default pemilikPage;