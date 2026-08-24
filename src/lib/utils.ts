export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2].split(' ')[0];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${day} ${months[monthIndex] || parts[1]} ${year}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

// Convert numbers into formal Indonesian words (Terbilang)
export function numberToTerbilang(angka: number): string {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];
  
  const num = Math.floor(Math.abs(angka));
  if (num === 0) return 'Nol Rupiah';

  function terbilangHelper(n: number): string {
    if (n < 12) {
      return bilangan[n];
    } else if (n < 20) {
      return terbilangHelper(n - 10) + ' Belas';
    } else if (n < 100) {
      return terbilangHelper(Math.floor(n / 10)) + ' Puluh ' + terbilangHelper(n % 10);
    } else if (n < 200) {
      return 'Seratus ' + terbilangHelper(n - 100);
    } else if (n < 1000) {
      return terbilangHelper(Math.floor(n / 100)) + ' Ratus ' + terbilangHelper(n % 100);
    } else if (n < 2000) {
      return 'Seribu ' + terbilangHelper(n - 1000);
    } else if (n < 1000000) {
      return terbilangHelper(Math.floor(n / 1000)) + ' Ribu ' + terbilangHelper(n % 1000);
    } else if (n < 1000000000) {
      return terbilangHelper(Math.floor(n / 1000000)) + ' Juta ' + terbilangHelper(n % 1000000);
    } else if (n < 1000000000000) {
      return terbilangHelper(Math.floor(n / 1000000000)) + ' Milyar ' + terbilangHelper(n % 1000000000);
    } else if (n < 1000000000000000) {
      return terbilangHelper(Math.floor(n / 1000000000000)) + ' Triliun ' + terbilangHelper(n % 1000000000000);
    }
    return '';
  }

  const result = terbilangHelper(num).replace(/\s+/g, ' ').trim();
  return `${result} Rupiah`;
}

export function generateDocNumber(prefix: 'MR' | 'PO' | 'SJ' | 'INV' | 'RT', existingCount: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const sequence = String(existingCount + 1).padStart(3, '0');
  return `${prefix}-${year}-${month}-${sequence}`;
}

export function getCurrentTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes} WIB`;
}

// -------------------------------------------------------------
// CSV & EXCEL TEMPLATE & PARSER HELPERS FOR MATERIAL REGISTRATION
// -------------------------------------------------------------

export function downloadMaterialCSVTemplate(delimiter: ';' | ',' = ';'): void {
  const headers = [
    'Kode SKU',
    'Nama Barang',
    'Kategori Material',
    'Spesifikasi',
    'Satuan',
    'Minimum Stok',
    'Stok Awal',
    'Harga Beli Satuan (Rp)',
    'Margin (%)',
    'Harga Jual Satuan (Rp)',
    'Lokasi Rak Gudang'
  ];

  const sampleRows = [
    [
      'MAT-BST-020',
      'Besi Hollow Galvanis 40x40 (4m)',
      'Konstruksi & Besi',
      'Ketebalan 1.8mm SNI Panjang 4 Meter',
      'Batang',
      '50',
      '120',
      '95000',
      '20',
      '114000',
      'Gudang Utama - Zona Besi B2'
    ],
    [
      'MAT-SMN-040',
      'Semen Mortar Plester Instan 40 Kg',
      'Bahan Bangunan',
      'Mortar Utama MU-301 Plester & Pasang Bata',
      'Zak',
      '100',
      '350',
      '68000',
      '15',
      '78200',
      'Gudang Utama - Pallet S5'
    ],
    [
      'ELC-LMP-050',
      'Lampu Sorot LED High Bay 150W IP65',
      'Electrical',
      'Philips / Osram Cool Daylight 6500K Industrial',
      'Pcs',
      '15',
      '30',
      '480000',
      '25',
      '600000',
      'Gudang Elektrik - Rak E-08'
    ]
  ];

  const formatCell = (cell: string | number) => {
    const str = String(cell);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.map(formatCell).join(delimiter),
    ...sampleRows.map(row => row.map(formatCell).join(delimiter))
  ];

  // Include UTF-8 BOM (\uFEFF) so Excel opens UTF-8 characters cleanly
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const filename = delimiter === ';' 
    ? 'template_registrasi_material_excel.csv' 
    : 'template_registrasi_material_standard.csv';
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ParsedMaterialRow {
  itemCode: string;
  name: string;
  category: string;
  specification: string;
  unit: string;
  minStock: number;
  currentStock: number;
  unitPrice: number;
  marginPercent: number;
  sellingPrice: number;
  warehouseLocation: string;
}

export function parseMaterialCSV(csvText: string): ParsedMaterialRow[] {
  if (!csvText || !csvText.trim()) return [];

  // Remove potential UTF-8 BOM
  let cleanText = csvText.replace(/^\uFEFF/, '').trim();

  // Split lines
  const rawLines = cleanText.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
  if (rawLines.length === 0) return [];

  // If first line is sep= directive, remove it
  let lines = rawLines;
  if (lines[0].toLowerCase().startsWith('sep=')) {
    lines = lines.slice(1);
  }
  if (lines.length <= 1) return [];

  // Detect delimiter (, or ; or \t)
  const headerLine = lines[0];
  const countSemicolons = (headerLine.match(/;/g) || []).length;
  const countCommas = (headerLine.match(/,/g) || []).length;
  const countTabs = (headerLine.match(/\t/g) || []).length;

  let delimiter = ',';
  if (countSemicolons >= countCommas && countSemicolons >= countTabs) {
    delimiter = ';';
  } else if (countTabs > countCommas) {
    delimiter = '\t';
  }

  // Helper to split CSV row taking quotes into account
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const results: ParsedMaterialRow[] = [];

  // Process rows after header
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length < 2 || !cols[1]) continue; // Skip empty row

    const itemCode = cols[0]?.trim() || `MAT-${Math.floor(100 + Math.random() * 900)}`;
    const name = cols[1]?.trim() || '';
    if (!name) continue;

    const category = cols[2]?.trim() || 'Konstruksi & Material';
    const specification = cols[3]?.trim() || '-';
    const unit = cols[4]?.trim() || 'Pcs';
    const minStock = parseFloat(cols[5]?.replace(/[^0-9.-]+/g, '')) || 10;
    const currentStock = parseFloat(cols[6]?.replace(/[^0-9.-]+/g, '')) || 0;
    const unitPrice = parseFloat(cols[7]?.replace(/[^0-9.-]+/g, '')) || 0;
    let marginPercent = parseFloat(cols[8]?.replace(/[^0-9.-]+/g, '')) || 20;
    let sellingPrice = parseFloat(cols[9]?.replace(/[^0-9.-]+/g, '')) || 0;

    if (unitPrice > 0) {
      if (sellingPrice > 0 && (!cols[8] || marginPercent === 0)) {
        marginPercent = Math.round(((sellingPrice - unitPrice) / unitPrice) * 100 * 10) / 10;
      } else if (sellingPrice === 0 || !cols[9]) {
        sellingPrice = Math.round(unitPrice * (1 + marginPercent / 100));
      }
    }

    const warehouseLocation = cols[10]?.trim() || 'Gudang Utama - Rak A1';

    results.push({
      itemCode,
      name,
      category,
      specification,
      unit,
      minStock,
      currentStock,
      unitPrice,
      marginPercent,
      sellingPrice,
      warehouseLocation
    });
  }

  return results;
}

