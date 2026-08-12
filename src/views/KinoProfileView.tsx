import React from 'react';
import { Building2, Globe, Sparkles, Target, Compass, Award, HeartHandshake, ArrowRight, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

export const KinoProfileView: React.FC = () => {
  const historyTimeline = [
    {
      year: '1991',
      title: 'Awal Pendirian (PT Duta Lestari Sentratama)',
      desc: 'Cikal bakal PT Kino Indonesia Tbk dimulai lewat PT Duta Lestari Sentratama (DLS) yang berfokus pada bisnis distribusi nasional.'
    },
    {
      year: '1997',
      title: 'Ekspansi Manufaktur (PT Kino Sentra Industrindo)',
      desc: 'Mendirikan PT Kino Sentra Industrindo (KSI) dengan produk awal permen bernama "Kino Candy". Berkembang memproduksi makanan ringan, snack, cokelat, dan minuman serbuk.'
    },
    {
      year: '1999',
      title: 'Masuk Industri Perawatan Tubuh (PT Kinocare Era Kosmetindo)',
      desc: 'Memperluas portofolio bisnis dengan mendirikan PT Kinocare Era Kosmetindo sebagai produsen aneka produk perawatan tubuh untuk semua gender dan usia.'
    },
    {
      year: '2014',
      title: 'Bertransformasi Menjadi PT Kino Indonesia Tbk',
      desc: 'PT Kinocare Era Kosmetindo berganti nama menjadi PT Kino Indonesia Tbk dengan produk utama pembersih muka "Ovale", vitamin rambut "Ellips", "Resik-V", dan "Eskulin".'
    },
    {
      year: 'Saat Ini',
      title: 'Perusahaan Multinasional Terkemuka',
      desc: 'Memiliki lebih dari 30 merek terpercaya yang tersebar di Indonesia dan mancanegara meliputi makanan, minuman, perawatan pribadi, perawatan bayi, rumah tangga, farmasi, hingga makanan hewan.'
    }
  ];

  const brandHighlights = [
    { name: 'Ellips', category: 'Hair Care', desc: 'Vitamin & Perawatan Rambut' },
    { name: 'Ovale', category: 'Face Care', desc: 'Pembersih Muka 2 in 1' },
    { name: 'Eskulin', category: 'Personal Care', desc: 'Parfum Gel & Cologne' },
    { name: 'Resik-V', category: 'Feminine Hygiene', desc: 'Sabun Khusus Kewanitaan' },
    { name: 'Cap Kaki Tiga', category: 'Beverage', desc: 'Minuman Pereda Panas Dalam' },
    { name: 'Sleek Baby', category: 'Baby Care', desc: 'Pembersih Botol & Sabun Bayi' },
    { name: 'Kino Candy', category: 'Confectionery', desc: 'Permen & Makanan Ringan' },
    { name: 'Samantha', category: 'Hair Color', desc: 'Pewarna Rambut' }
  ];

  return (
    <div className="space-y-8 animate-fast-in pb-8">
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -top-10 w-60 h-60 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Profile Resmi Perusahaan</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
            <div className="p-3 bg-white rounded-2xl shadow-md shrink-0 w-fit">
              <img 
                src="https://res.cloudinary.com/dedtb3vnj/image/upload/v1782568576/kino_yrhkmc.png" 
                alt="PT Kino Indonesia Tbk Logo" 
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                PT Kino Indonesia Tbk
              </h1>
              <p className="text-orange-300 text-sm font-semibold italic mt-0.5">
                "Innovate Today, Creating Tomorrow"
              </p>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal pt-2">
            Perusahaan consumer goods terkemuka di Indonesia yang berlandaskan ide dan inovasi berstandar kualifikasi internasional, menghadirkan produk unggulan bermutu tinggi untuk masyarakat Indonesia dan dunia.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <a
              href="https://kino.co.id/id/company/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs btn-fast cursor-pointer shadow-md shadow-orange-950/50"
            >
              <span>Situs Resmi Kino (kino.co.id)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Profile Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Company History & Narrative */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Profil & Sejarah Singkat</h2>
                <p className="text-xs text-slate-500">Perjalanan transformasi Kino dari distribusi hingga perusahaan global</p>
              </div>
            </div>

            <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
              <p>
                Cikal bakal <strong className="text-slate-900 font-semibold">PT Kino Indonesia Tbk (Kino)</strong> dimulai pada tahun 1991 lewat perusahaan yang bernama <strong className="text-slate-900 font-semibold">PT Duta Lestari Sentratama (DLS)</strong> yang berfokus dalam menjalankan bisnis distribusi.
              </p>
              <p>
                Seiring dengan perkembangan waktu, DLS mengembangkan portofolio usahanya dengan mendirikan <strong className="text-slate-900 font-semibold">PT Kino Sentra Industrindo (KSI)</strong> pada tahun 1997. Produk awal saat itu adalah permen dengan nama <span className="italic font-medium text-orange-600">"Kino Candy"</span>. Kemudian, KSI terus berkembang dan bertransformasi memproduksi makanan ringan seperti permen, snack, cokelat, serta minuman berperisa serbuk yang diterima sangat baik di pasar nasional maupun mancanegara.
              </p>
              <p>
                Dengan strategi usaha yang tepat, bisnis grup KINO berkembang pesat dan mendorong mendirikan <strong className="text-slate-900 font-semibold">PT Kinocare Era Kosmetindo</strong> di tahun 1999 sebagai produsen produk perawatan tubuh. Pada tahun 2014, berfokus nama menjadi <strong className="text-slate-900 font-semibold">PT Kino Indonesia Tbk</strong> dengan deretan produk legendaris seperti <span className="font-semibold text-slate-900">Ovale, Ellips, Resik-V,</span> dan <span className="font-semibold text-slate-900">Eskulin</span>.
              </p>
              <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-slate-800">
                Hingga saat ini, Kino Indonesia telah memiliki beragam produk mulai dari makanan, minuman, perawatan pribadi, perawatan bayi, rumah tangga, farmasi, hingga makanan hewan dengan lebih dari <strong className="text-orange-600 font-bold">30 merek</strong> yang tersebar di berbagai negara di seluruh dunia.
              </p>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Jejak Langkah Perkembangan Perusahaan</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-200">
              {historyTimeline.map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-orange-600 border-4 border-white shadow-xs"></div>
                  <div className="bg-slate-50/80 hover:bg-orange-50/40 p-4 rounded-xl border border-slate-200/60 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-orange-600 px-2 py-0.5 rounded-md bg-orange-100 border border-orange-200/60">
                        {item.year}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Vision, Mission & Brand Grid */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Vision & Mission Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Visi & Misi Perusahaan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Landasan nilai dan panduan Perseroan mencapai tujuan bersama.
              </p>
            </div>

            {/* Vision */}
            <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-orange-700 font-extrabold text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4 text-orange-600" />
                <span>Visi Perusahaan</span>
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                "Menjadi perusahaan ternama di Indonesia yang berlandaskan ide dan inovasi dan terus bergerak untuk menjadi perusahaan yang mendunia tanpa meninggalkan nilai-nilai lokal."
              </p>
            </div>

            {/* Mission */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xs uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4 text-blue-600" />
                <span>Misi Perusahaan</span>
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                "Memperluas pasar melalui pengembangan produk yang didorong oleh semangat untuk berinovasi."
              </p>
            </div>

            {/* Innovation Commitment */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Komitmen Inovasi</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kami terus-menerus melakukan inovasi dan riset pasar dengan mengutamakan kebutuhan pelanggan dan menghasilkan produk dengan kualitas terbaik yang memenuhi standar kualifikasi internasional.
              </p>
            </div>
          </div>

          {/* Popular Brands Showcase */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-600" />
                <span>Merek Utama Kino Group</span>
              </span>
              <span className="text-[10px] font-extrabold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                30+ Brands
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {brandHighlights.map((brand, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-white hover:border-orange-300 transition">
                  <span className="text-[10px] font-bold text-orange-600 block uppercase tracking-wider">
                    {brand.category}
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">{brand.name}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{brand.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
