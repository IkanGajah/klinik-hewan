import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  return (
    <main>
        <div className="pt-18 flex flex-col justify-center items-center text-center text-black px-4">
          <Image src="/assetImage/hengker.jpg" alt="Profile" className="w-40 h-40 rounded-full shadow-lg border-4 border-black mb-6 object-cover" width={200} height={200} />
          <h1 className="text-5xl font-bold mb-2">Klinik Hewan CP</h1>
          <p className="text-lg">Klinik hewan dengan pengurus hewan</p>        
        </div>
        <div id="about" className="py-10 px-6 text-gray-800">   
          <div className="max-w-5xl mx-auto text-center bg-white rounded-2xl p-6">
            <h2 className="text-4xl font-bold mb-6">Selamat Datang!</h2>
            <p className="mb-2 text-lg text-gray-600 ">Selamat datang, ini adalah web klinik hewan yang kami gunakan untuk memanajemen semua kegiatan yang berhubungan dengan klinik ini. 
              Pusat dari web ini adalah halaman Kunjungan dimana kami menyimpan kunjungan yang dilakukan klien di klinik ini,
              silahkan kunjungi halaman Kunjungan yang tersedia atau bisa klik tombol dibawah. 
            </p>
          </div>
          <Link href='/kunjungan' className="px-1 py-2 mr-auto ml-auto max-w-5xl
           text-2xl mt-10 bg-green-600 text-white outline-2 transition hover:bg-white hover:text-black font-bold rounded flex justify-center outline">Mulai dari sini!</Link>
        </div>
    </main>
  );
}