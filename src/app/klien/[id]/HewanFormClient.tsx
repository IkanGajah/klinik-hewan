'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClientForBrowser } from '@/lib/supabase';

const supabase = createSupabaseClientForBrowser();

export default function HewanFormClient({ pemilikId, initial }: { pemilikId: string; initial?: any | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    id_hewan: initial?.id_hewan ?? '',
    nama: initial?.nama ?? '',
    jenis: initial?.jenis ?? '',
    ras: initial?.ras ?? '',
    tanggal_lahir: initial?.tanggal_lahir ? initial.tanggal_lahir.split('T')[0] : '',
    jenis_kelamin: initial?.jenis_kelamin ?? ''
  });
  const [loading, setLoading] = useState(false);

  const createHewan = async () => {
    setLoading(true);
    const { error } = await supabase.from('hewan').insert([{ ...form, id_pemilik: pemilikId }]);
    setLoading(false);
    if (!error) {
      setForm({ id_hewan: '', nama: '', jenis: '', ras: '', tanggal_lahir: '', jenis_kelamin: '' });
      router.refresh();
    } else {
      console.error(error);
      alert('Gagal tambah hewan');
    }
  };

  const updateHewan = async () => {
    if (!initial?.id_hewan) return;
    setLoading(true);
    const { error } = await supabase.from('hewan').update(form).eq('id_hewan', initial.id_hewan);
    setLoading(false);
    if (!error) {
      router.refresh();
    } else {
      console.error(error);
      alert('Gagal update hewan');
    }
  };

  const deleteHewan = async () => {
    if (!initial?.id_hewan) return;
    if (!confirm('Yakin hapus hewan ini?')) return;
    setLoading(true);
    const { error } = await supabase.from('hewan').delete().eq('id_hewan', initial.id_hewan);
    setLoading(false);
    if (!error) {
      router.refresh();
    } else {
      console.error(error);
      alert('Gagal hapus hewan');
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="space-y-2">
          <input
            className="border px-3 py-2 w-full rounded"
            placeholder="ID Hewan"
            value={form.id_hewan}
            onChange={e => setForm({...form, id_hewan: e.target.value})}
          />
        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Nama Hewan"
          value={form.nama}
          onChange={e => setForm({...form, nama: e.target.value})}
        />
        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Jenis (ex: Kucing, Anjing)"
          value={form.jenis}
          onChange={e => setForm({...form, jenis: e.target.value})}
        />
        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Ras"
          value={form.ras}
          onChange={e => setForm({...form, ras: e.target.value})}
        />
        <select
          className="border px-3 py-2 w-full rounded"
          value={form.jenis_kelamin}
          onChange={e => setForm({...form, jenis_kelamin: e.target.value})}
        >
          <option value="">-- Pilih Gender --</option>
          <option value="Jantan">Jantan</option>
          <option value="Betina">Betina</option>
        </select>
        <input
          className="border px-3 py-2 w-full rounded"
          type="date"
          value={form.tanggal_lahir}
          onChange={e => setForm({...form, tanggal_lahir: e.target.value})}
        />
      </div>

      <div className="flex gap-2 mt-3">
        {initial ? (
          <>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              onClick={updateHewan}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Update'}
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              onClick={deleteHewan}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </>
        ) : (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            onClick={createHewan}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Tambah Hewan'}
          </button>
        )}
      </div>
    </div>
  );
}