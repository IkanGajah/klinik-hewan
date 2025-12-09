export type Idetail_layanan = {
  id_detail_layanan: string;
  id_kunjungan: string;
  id_jenis_layanan: string;
  harga_saat_layanan: number;
  jenis_layanan?: {
        nama_layanan: string;
        kategori: string;
    }
}
