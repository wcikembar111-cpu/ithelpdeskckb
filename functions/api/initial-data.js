export async function onRequest(context) {
  const defaultData = {
    success: true,
    message: 'Initial data loaded via Cloudflare Pages Function',
    data: {
      currentUser: {
        Id: 'usr_public_01',
        Username: 'public',
        Nama: 'User Public Kino',
        Role: 'User Public',
        MustChangePassword: false,
        Status: 'Active'
      },
      tickets: [
        {
          Id: 'tkt_001',
          Ejob: 'EJOB/2026/07/001',
          Tanggal: new Date().toISOString().split('T')[0],
          Nama: 'Siti Rahma',
          NoWa: '08123456789',
          Departement: 'Produksi',
          Lokasi: 'Gedung B Lt.2 Area QC',
          Kategori: 'Printer',
          TypeTicket: 'Incident',
          Subject: 'Printer thermal barcode label macet / error paper jam',
          Description: 'Printer label barcode cetak tidak jelas dan kertas sering tersangkut saat pemindaian kemasan.',
          Status: 'Open',
          CreatedAt: new Date().toISOString(),
          UpdatedAt: new Date().toISOString(),
          Creator: 'user_kino'
        }
      ],
      users: [],
      settings: {
        Departments: ['IT', 'HRD', 'Finance', 'Produksi', 'Warehouse', 'QA/QC', 'Logistik', 'Purchasing'],
        Categories: ['Hardware', 'Software', 'Network', 'Printer', 'Email', 'ERP/System', 'Lainnya'],
        LoginBgUrl: 'https://res.cloudinary.com/dedtb3vnj/image/upload/v1785044494/header-brands0526_co10uq.jpg',
        ItPhone: '6281234567890'
      }
    }
  };

  return new Response(JSON.stringify(defaultData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  });
}
