'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FormEvent, useEffect, useState } from 'react';
import type { Idokter } from '../../types/dokter';
import type { Ipemilik } from '../../types/pemilik';
import {createSupabaseClientForBrowser} from '@/lib/supabase';
import { Ellipsis } from "lucide-react";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const supabase = createSupabaseClientForBrowser();


const bukuPage = () => {
    const [dokter, setDokter] = useState<Idokter[]>([]);
    const [pemilik, setPemilik] = useState<Ipemilik[]>([]);
    const [createDialog, setCreateDialog] = useState(false);    
    const [selectedDokter, setSelectedDokter] = useState<{
        dokter: Idokter;
        action: 'edit' | 'delete';
    } | null>(null);
    const [editForm, setEditForm] = useState({
        id_dokter: '',
        nama_dokter: '',
        spesialisasi: '',
        no_telepon: ''
    });

    const fetchMenu = async () => {
      const {data: dataDokter, error: errorDokter} = await supabase.from('dokter').select('*, kunjungan!left(id_kunjungan)').order('id_dokter');  
      if (errorDokter) {
        console.log('Error', errorDokter);
      } else {
        console.log('Data dokter:', dataDokter);
        setDokter(dataDokter ?? []);
      }
      
      const {data: dataPemilik, error: errorPemilik} = await supabase.from('pemilik').select('*, kunjungan!left(id_kunjungan)').order('id_pemilik');  
      if (errorPemilik) {
        console.log('Error', errorPemilik);
      } else {
        console.log('Data pemilik:', dataPemilik);
        setPemilik(dataPemilik ?? []);
      }
    };

    useEffect (() => { 
        fetchMenu();
    }, []);


  return (
    <div className="container mx-auto py-8">
        <div className="text-3xl font-bold">Buku Telepon</div>
        <div className="mb-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-neutral-700 font-bold">Nama</TableHead>
                            <TableHead className="text-neutral-700 font-bold text-center">No Telepon</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
        </div>            
    </div>
    )
}
export default bukuPage;