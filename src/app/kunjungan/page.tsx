'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FormEvent, useEffect, useState } from 'react';
import type { Ikunjungan } from '@/types/kunjungan';
import type { Ihewan } from '@/types/hewan';
import type { Idokter } from '@/types/dokter';
import {createSupabaseClientForBrowser} from '@/lib/supabase';
import { Ellipsis } from "lucide-react";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const supabase = createSupabaseClientForBrowser();

const kunjunganPage = () => {
    const [kunjungan, setKunjungan] = useState<Ikunjungan[]>([]);
    const [hewan, setHewan] = useState<Map<string, Ihewan>>(new Map());
    const [Idokter, setIdokter] = useState<Map<string, Idokter>>(new Map());
    const [createDialog, setCreateDialog] = useState(false);
    const [selectedKunjungan, setSelectedKunjungan] = useState<{
        kunjungan: Ikunjungan;
        action: 'edit' | 'delete';
    } | null>(null);

    const fetchMenu = async () => {
        const {data, error} = await supabase.from('kunjungan').select('*').order('id_kunjungan');  
        if (error) {
            console.log('Error', error);
        } else {
            setKunjungan(data ?? []);
        }
    };

    const fetchHewan = async () => {
        const {data, error} = await supabase.from('hewan').select('*');  
        if (error) {
            console.log('Error fetching hewan', error);
        } else {
            const hewanMap = new Map(data?.map((h) => [h.id_hewan, h]) ?? []);
            setHewan(hewanMap);
        }
    };

    const fetchDokter = async () => {
        const {data, error} = await supabase.from('dokter').select('*');  
        if (error) {
            console.log('Error fetching dokter', error);
        } else {
            const dokterMap = new Map(data?.map((d) => [d.id_dokter, d]) ?? []);
            setIdokter(dokterMap);
        }
    };

    useEffect (() => {
        fetchMenu();
        fetchHewan();
        fetchDokter();
    }, []);

    const handleAddKunjungan = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            const { data, error } = await supabase.from('kunjungan').insert(Object.fromEntries(formData)).select();
            if (error) {
                console.log('Error', error);
            } else {
                if (data) {
                    setKunjungan((prev) => [...data, ...prev]);
                }
                toast('kunjungan berhasil ditambahkan');
                setCreateDialog(false);
            }
        } catch (error) {
            console.log('Error', error);
        }
        fetchMenu();
    };

    const handleDeleteKunjungan = async () => {
        if (!selectedKunjungan) {
            console.log('No selected menu — abort delete');
            return;
        }
        try {
            const id_kunjungan = selectedKunjungan.kunjungan.id_kunjungan;
            const { data, error } = await supabase.from('kunjungan').delete().eq('id_kunjungan', id_kunjungan);
            if (error) console.log('Error', error);
            else {
                setKunjungan((prev) => prev.filter((kunjungan) => kunjungan.id_kunjungan !== selectedKunjungan.kunjungan.id_kunjungan));
                toast('kunjungan berhasil dihapus');
                setSelectedKunjungan(null);
            }
        } catch (err) {
            console.log('Error', err);
        }
        fetchMenu();
    };

    const handleEditKunjungan = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newData = Object.fromEntries(formData);
        if (!selectedKunjungan?.kunjungan?.id_kunjungan) {
            console.log('No selected menu id — abort edit');
            return;
        }
        try {
            const id = selectedKunjungan.kunjungan.id_kunjungan;
            const { error } = await supabase.from('kunjungan').update(newData).eq('id_kunjungan', id);
            if (error) {
                console.log('Error', error);
            } else {
                setKunjungan((prev) => prev.map((kunjungan) => kunjungan.id_kunjungan === id ? {...kunjungan, ...newData} : kunjungan));
                toast('kunjungan berhasil diedit');
                setSelectedKunjungan(null);
            }
        } catch (err) {
            console.log('Error', err);
        }
    fetchMenu();
    };

    const getNamaHewan = (idHewan: string | null | undefined) => {
        if (!idHewan) return '...';
        return hewan.get(idHewan)?.nama ?? 'Nama (Unknown)';
    };

    const getNamaDokter = (idDokter: string | null | undefined) => {
        if (!idDokter) return '...';
        return Idokter.get(idDokter)?.nama_dokter ?? 'Nama (Unknown)';
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-4 w-full flex justify-between">
                <div className="text-3xl font-bold">Kunjungan</div>
                
                <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="font-bold" onClick={() => setCreateDialog(true)}>Add Kunjungan</Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                        <form onSubmit={handleAddKunjungan} className="space-y-4">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Add Kunjungan</DialogTitle>
                                <DialogDescription>Tambahkan Kunjungan Dengan Mengisi Form Berikut</DialogDescription>
                            </DialogHeader>
                            <div className="grid w-full gap-4">
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="id_kunjungan">ID Kunjungan</Label>
                                    <Input id="id_kunjungan" name="id_kunjungan" placeholder="Masukkan ID Kunjungan" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="id_hewan">ID Hewan</Label>
                                    <Input id="id_hewan" name="id_hewan" placeholder="Masukkan ID Hewan" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="id_dokter">ID Dokter</Label>
                                    <Input id="id_dokter" name="id_dokter" placeholder="Masukkan ID Dokter" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="tanggal_kunjungan">Tanggal Kunjungan</Label>
                                    <Input id="tanggal_kunjungan" name="tanggal_kunjungan" placeholder="Masukkan Tanggal Kunjungan" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="berat_badan_saat_kunjungan">Berat Badan</Label>
                                    <Input id="berat_badan_saat_kunjungan" name="berat_badan_saat_kunjungan" placeholder="Masukkan Berat Badan" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="keluhan_awal">Keluhan Awal</Label>
                                    <Input id="keluhan_awal" name="keluhan_awal" placeholder="Masukkan Keluhan Awal" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="hasil_pemeriksaan">Hasil Pemeriksaan</Label>
                                    <Input id="hasil_pemeriksaan" name="hasil_pemeriksaan" placeholder="Masukkan Hasil Pemeriksaan" required />
                                </div>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="diagnosa">Diagnosa</Label>
                                    <Input id="diagnosa" name="diagnosa" placeholder="Masukkan Diagnosa" required />
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
                            <TableHead className="text-neutral-700 font-bold">ID Kunjugan</TableHead>
                            <TableHead className="text-neutral-700 font-bold">ID Hewan</TableHead>
                            <TableHead className="text-neutral-700 font-bold">ID Dokter</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Tanggal Kunjungan</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Berat Badan</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Keluhan Awal</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Hasil Pemeriksaan</TableHead>
                            <TableHead className="text-neutral-700 font-bold">Diagnosa</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {kunjungan && kunjungan.length > 0 ? (kunjungan.map(k => (
                        <TableRow key={k.id_kunjungan}>
                            <TableCell>{k.id_kunjungan}</TableCell>
                            <TableCell>{k.id_hewan + "-" + getNamaHewan(k.id_hewan)}</TableCell>
                            <TableCell>{k.id_dokter + "-" + getNamaDokter(k.id_dokter)}</TableCell>
                            <TableCell>{k.tanggal_kunjungan}</TableCell>
                            <TableCell>{k.berat_badan_saat_kunjungan}</TableCell>
                            <TableCell>{k.keluhan_awal}</TableCell>
                            <TableCell>{k.hasil_pemeriksaan}</TableCell>
                            <TableCell>{k.diagnosa}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild className="cursor-pointer">
                                        <Ellipsis />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel className="font-bold">Action</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => setSelectedKunjungan({kunjungan: k, action: 'edit'})} >Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSelectedKunjungan({kunjungan: k, action: 'delete'})} className="text-red-400">Delete</DropdownMenuItem>
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


            <Dialog open={selectedKunjungan !=null && selectedKunjungan.action === 'delete'} onOpenChange={(open) => {
                if (!open) {
                    setSelectedKunjungan(null);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Delete Kunjungan</DialogTitle>
                            <DialogDescription>Apakah kamu yakin ingin menghapus kunjungan ini {selectedKunjungan?.kunjungan.id_kunjungan}?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleDeleteKunjungan} variant="destructive" className="cursor-pointer">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    
            <Dialog open={selectedKunjungan !=null && selectedKunjungan.action === 'edit'} onOpenChange={(open) => {
                if (!open) {
                    setSelectedKunjungan(null);
                }
            }}>  
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleEditKunjungan} className="space-y-4">
                        <DialogHeader className="hidden">
                            <DialogTitle className="text-2xl font-bold">Add Kunjungan</DialogTitle>
                            <DialogDescription>Tambahkan Kunjungan Dengan Mengisi Form Berikut</DialogDescription>
                        </DialogHeader>
                        <div className="grid w-full gap-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_kunjungan">ID Kunjungan</Label>
                                <Input id="id_kunjungan" name="id_kunjungan" placeholder="Masukkan ID Kunjungan" required defaultValue={selectedKunjungan?.kunjungan.id_kunjungan || ''}/>
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_hewan">ID Hewan</Label>
                                <Input id="id_hewan" name="id_hewan" placeholder="Masukkan ID Hewan" required defaultValue={selectedKunjungan?.kunjungan.id_hewan || ''}/>
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="id_dokter">ID Dokter</Label>
                                <Input id="id_dokter" name="id_dokter" placeholder="Masukkan ID Dokter" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="tanggal_kunjungan">Tanggal Kunjungan</Label>
                                <Input id="tanggal_kunjungan" name="tanggal_kunjungan" placeholder="Masukkan Tanggal Kunjungan" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="berat_badan_saat_kunjungan">Berat Badan</Label>
                                <Input id="berat_badan_saat_kunjungan" name="berat_badan_saat_kunjungan" placeholder="Masukkan Berat Badan" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="keluhan_awal">Keluhan Awal</Label>
                                <Input id="keluhan_awal" name="keluhan_awal" placeholder="Masukkan Keluhan Awal" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="hasil_pemeriksaan">Hasil Pemeriksaan</Label>
                                <Input id="hasil_pemeriksaan" name="hasil_pemeriksaan" placeholder="Masukkan Hasil Pemeriksaan" required />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="diagnosa">Diagnosa</Label>
                                <Input id="diagnosa" name="diagnosa" placeholder="Masukkan Diagnosa" required />
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
export default kunjunganPage;