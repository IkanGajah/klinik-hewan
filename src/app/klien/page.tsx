'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FormEvent, useEffect, useState } from 'react';
import type { Idokter } from '@/types/dokter';
import type { Ihewan } from '@/types/hewan';
import type { Ipemilik } from '@/types/pemilik';
import {supabase} from '@/lib/supabase';
import { Ellipsis } from "lucide-react";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const clientPage = () => {
    const [dokter, setDokter] = useState<Idokter[]>([]);
    const [createDialog, setCreateDialog] = useState(false);
    const [selectedDokter, setSelectedDokter] = useState<{
        dokter: Idokter;
        action: 'edit' | 'delete';
    } | null>(null);

const fetchMenu = async () => {
    const {data, error} = await supabase.from('dokter').select('*').order('id_dokter');  
    if (error) {
        console.log('Error', error);
    } else {
        setDokter(data ?? []);
    }
};

useEffect (() => {
    fetchMenu();
}, [supabase]);

const handleAddClient = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
        const { data, error } = await supabase.from('dokter').insert(Object.fromEntries(formData)).select();
        if (error) {
            console.log('Error', error);
        } else {
            if (data) {
                setDokter((prev) => [...data, ...prev]);
            }
            toast('dokter berhasil ditambahkan');
            setCreateDialog(false);
        }
    } catch (error) {
        console.log('Error', error);
    }
    fetchMenu();
};

const handleDeleteClient = async () => {
    if (!selectedDokter) {
        console.log('No selected menu — abort delete');
        return;
    }
    try {
        const id_dokter = selectedDokter.dokter.id_dokter;
        const { data, error } = await supabase.from('dokter').delete().eq('id_dokter', id_dokter);
        if (error) console.log('Error', error);
        else {
            setDokter((prev) => prev.filter((dokter) => dokter.id_dokter !== selectedDokter.dokter.id_dokter));
            toast('dokter berhasil dihapus');
            setSelectedDokter(null);
        }
    } catch (err) {
        console.log('Error', err);
    }
    fetchMenu();
};

const handleEditClient = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newData = Object.fromEntries(formData);
    if (!selectedDokter?.dokter?.id_dokter) {
        console.log('No selected menu id — abort edit');
        return;
    }
    try {
        const id = selectedDokter.dokter.id_dokter;
        const { error } = await supabase.from('dokter').update(newData).eq('id_dokter', id);
        if (error) {
            console.log('Error', error);
        } else {
            setDokter((prev) => prev.map((dokter) => dokter.id_dokter === id ? {...dokter, ...newData} : dokter));
            toast('dokter berhasil diedit');
            setSelectedDokter(null);
        }
    } catch (err) {
        console.log('Error', err);
    }
fetchMenu();
};

return (
    <div className="container mx-auto py-8">
        <div className="mb-4 w-full flex justify-between">
            <div className="text-3xl font-bold">Dokter</div>
            
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogTrigger asChild>
                    <Button className="font-bold" onClick={() => setCreateDialog(true)}>Add Dokter</Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleAddClient} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Add Client</DialogTitle>
                            <DialogDescription>Tambahkan Client Dengan Mengisi Form Berikut</DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_dokter">ID Dokter</Label>
                                <Input id="id_dokter" name="id_dokter" placeholder="Masukkan ID Dokter" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_hewan">ID Hewan</Label>
                                <Input id="id_hewan" name="id_hewan" placeholder="Masukkan ID Hewan" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_pemilik">ID Pemilik</Label>
                                <Input id="id_pemilik" name="id_pemilik" placeholder="Masukkan ID Pemilik" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">submit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>


        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-neutral-700 font-bold">ID Dokter</TableHead>
                        <TableHead className="text-neutral-700 font-bold">ID Hewan</TableHead>
                        <TableHead className="text-neutral-700 font-bold">ID Pemilik</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                  {dokter && dokter.length > 0 ? (
                    dokter.map(k => (
                    <TableRow key={k.id_dokter}>
                        <TableCell>{k.id_dokter}</TableCell>
                        <TableCell>{k.id_hewan}</TableCell>
                        <TableCell>{k.id_pemilik}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="cursor-pointer">
                                    <Ellipsis />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel className="font-bold">Action</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => setSelectedDokter({dokter: k, action: 'edit'})} >Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSelectedDokter({dokter: k, action: 'delete'})} className="text-red-400">Delete</DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))) : (
                    <TableRow>
                        <TableCell colSpan={10} className="text-center py-4">Loading...</TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>


        <Dialog open={selectedDokter !=null && selectedDokter.action === 'delete'} onOpenChange={(open) => {
            if (!open) {
                setSelectedDokter(null);
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Delete Client</DialogTitle>
                        <DialogDescription>Apakah kamu yakin ingin menghapus client ini {selectedDokter?.dokter.id_Dokter}?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleDeleteClient} variant="destructive" className="cursor-pointer">Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
  
        <Dialog open={selectedDokter !=null && selectedDokter.action === 'edit'} onOpenChange={(open) => {
            if (!open) {
                setSelectedDokter(null);
            }
        }}>  
            <DialogContent className="sm:max-w-md ">
                <form onSubmit={handleEditClient} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Add Client</DialogTitle>
                        <DialogDescription className="sm:hidden">Tambahkan Client Dengan Mengisi Form Berikut</DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full gap-4">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="id_dokter">ID Dokter</Label>
                            <Input id="id_dokter" name="id_dokter" placeholder="Masukkan ID Dokter" required defaultValue={selectedDokter?.dokter.id_Dokter || ''}/>
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="id_hewan">ID Hewan</Label>
                            <Input id="id_hewan" name="id_hewan" placeholder="Masukkan ID Hewan" required defaultValue={selectedDokter?.dokter.id_hewan || ''}/>
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="id_pemilik">ID Pemilik</Label>
                            <Input id="id_pemilik" name="id_pemilik" placeholder="Masukkan ID Pemilik" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">submit</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
    )
}
export default clientPage;