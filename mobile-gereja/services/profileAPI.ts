import { API_URL } from "../utils/api";

// 1. Fungsi Ambil Data Profil
export const fetchUserProfileAPI = async (email: string, token: string) => {
  const query = {
    query: `
      query GetUserProfile($email: String!) {
        users(where: { emailUser: { equals: $email } }) {
          id
          namaUser
          emailUser
          profile {
            id
            nama
            alamat
            domisili
            nomorWa
            jenisKelamin
            pendidikan
            pekerjaan
            tanggalLahir
            statusPernikahan
            statusKeanggotaan
            fotoProfil
          }
        }
      }
    `,
    variables: { email },
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(query),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);

  return json?.data?.users?.[0]; // Mengembalikan data user pertama yang ketemu
};

// 2. Fungsi Simpan / Update Profil
export const saveUserProfileAPI = async (
  userId: string,
  profileId: string | null,
  data: any,
  token: string,
) => {
  if (profileId) {
    const mutation = {
      query: `
        mutation UpdateProfile(
          $profileId: ID!,
          $nama: String!,
          $alamat: String,
          $domisili: String,
          $noWa: String,
          $jk: String,
          $pendidikan: String,
          $pekerjaan: String,
          $statusKawin: String,
          $statusKeanggotaan: String,
          $tglLahir: String,
          $fotoProfil: String
        ) {
          updateProfile(
            where: { id: $profileId }
            data: {
              nama: $nama
              alamat: $alamat
              domisili: $domisili
              nomorWa: $noWa
              jenisKelamin: $jk
              pendidikan: $pendidikan
              pekerjaan: $pekerjaan
              statusPernikahan: $statusKawin
              statusKeanggotaan: $statusKeanggotaan
              tanggalLahir: $tglLahir
              fotoProfil: $fotoProfil
            }
          ) {
            id
          }
        }
      `,
      variables: { profileId, ...data },
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mutation),
    });

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);

    // Bentuk return disamakan biar profile.tsx tidak perlu diubah
    return {
      id: userId,
      profile: { id: json.data.updateProfile.id },
    };
  }

  const mutation = {
    query: `
      mutation CreateProfile(
        $userId: ID!,
        $nama: String!,
        $alamat: String,
        $domisili: String,
        $noWa: String,
        $jk: String,
        $pendidikan: String,
        $pekerjaan: String,
        $statusKawin: String,
        $statusKeanggotaan: String,
        $tglLahir: String,
        $fotoProfil: String
      ) {
        updateUser(
          where: { id: $userId }
          data: {
            profile: {
              create: {
                nama: $nama
                alamat: $alamat
                domisili: $domisili
                nomorWa: $noWa
                jenisKelamin: $jk
                pendidikan: $pendidikan
                pekerjaan: $pekerjaan
                statusPernikahan: $statusKawin
                statusKeanggotaan: $statusKeanggotaan
                tanggalLahir: $tglLahir
                fotoProfil: $fotoProfil
              }
            }
          }
        ) {
          id
          profile { id }
        }
      }
    `,
    variables: { userId, ...data },
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(mutation),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.updateUser;
};

// 3. Fungsi Hapus Data Backend (Soft Delete User & Hard Delete Profile)
export const deleteBackendDataAPI = async (
  userId: string | null,
  profileId: string | null,
  token: string,
  userEmail: string,
) => {
  // Soft Delete User & Samarkan Email
  if (userId && userEmail) {
    // Membuat email unik agar tidak bentrok jika user mendaftar lagi
    const timestamp = Date.now();
    const deletedEmail = `deleted_${timestamp}_${userEmail}`;

    const res1 = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `mutation SoftDeleteUser($id: ID!, $newEmail: String!) { 
          updateUser(
            where: { id: $id }, 
            data: { 
              statusAktivasi: "nonaktif",
              emailUser: $newEmail 
            }
          ) { id } 
        }`,
        variables: { id: userId, newEmail: deletedEmail },
      }),
    });

    const json1 = await res1.json();
    if (json1.errors)
      throw new Error("Gagal nonaktifkan User: " + json1.errors[0].message);
  }

  // Hard Delete Profile (Biarin ke-delete selamanya karena nanti buat baru)
  if (profileId) {
    const res2 = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `mutation DeleteProfile($id: ID!) { 
          deleteProfile(where: { id: $id }) { id } 
        }`,
        variables: { id: profileId },
      }),
    });

    const json2 = await res2.json();
    if (json2.errors)
      throw new Error("Gagal hapus Profile: " + json2.errors[0].message);
  }
};

// 4. Fungsi Cari ID User (Khusus untuk halaman CompleteProfile)
export const findUserIdAPI = async (email: string, token: string) => {
  const query = {
    query: `
      query FindUser($email: String!) {
        users(where: { emailUser: { equals: $email } }) {
          id
        }
      }
    `,
    variables: { email },
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(query),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.users?.[0]?.id;
};

// GEREJA & PENDETA

// 5. Ambil Data Gereja (profil, sejarah, login)
export const fetchGerejaAPI = async () => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          gerejas {
            id
            nama
            alamat
            hari
            telepon
            linkWhatsapp
            linkInstagram
            linkYoutube
            linkFacebook
            linkEmail
            gambar { url }
            logo { url }
            sejarah
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.gerejas?.[0];
};

// 6. Ambil Data Pendeta
export const fetchPendetaAPI = async () => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          pendetas {
            id
            nama
            email
            sejakKapanAktif
            foto { url }
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.pendetas ?? [];
};

// KONTEN PUBLIK

// 7. Ambil Ayat Harian Terbaru
export const fetchAyatHarianAPI = async () => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          ayatHarians(orderBy: { tanggal: desc }, take: 1) {
            book
            chapter
            verse
            text
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.ayatHarians?.[0] ?? null;
};

// 8. Ambil Jadwal Rutin
export const fetchJadwalRutinAPI = async () => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          jadwalRutins(orderBy: { namaIbadah: asc }) {
            id
            namaIbadah
            nama
            waktu {
              id
              jam
            }
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.jadwalRutins ?? [];
};

// 9. Ambil Semua Warta (list only, tanpa isiWarta yang berat)
export const fetchWartaAPI = async (take: number = 50, skip: number = 0) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetWartas($take: Int!, $skip: Int!) {
          wartas(
            orderBy: { masaBerlaku: desc }
            take: $take
            skip: $skip
          ) {
            id
            judul
            masaBerlaku
            tanggalPelaksanaan
            kategori { nama }
            gambar { url }
          }
        }
      `,
      variables: { take, skip },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.wartas ?? [];
};

// 9b. Ambil Isi Warta (lazy load saat user expand)
export const fetchWartaContentAPI = async (id: string) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetWartaContent($id: ID!) {
          warta(where: { id: $id }) {
            isiWarta { document }
          }
        }
      `,
      variables: { id },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.warta?.isiWarta ?? null;
};

// JADWAL IBADAH

// 10. Jadwal Ibadah Mendatang (untuk Home)
export const fetchJadwalIbadahUpcomingAPI = async (
  fromDate: string,
  take: number,
) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          jadwalIbadahs(
            where: { tanggal: { gte: "${fromDate}" } }
            orderBy: { tanggal: asc }
            take: ${take}
          ) {
            id
            tanggal
            detailIbadah {
              id
              jam
              banner { url }
            }
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.jadwalIbadahs ?? [];
};

// 11. Jadwal Ibadah Rentang Tanggal (untuk halaman Jadwal Ibadah)
export const fetchJadwalIbadahRangeAPI = async (from: string, to: string) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          jadwalIbadahs(
            where: { tanggal: { gte: "${from}", lte: "${to}" } }
            orderBy: { tanggal: asc }
          ) {
            id
            tanggal
            topik
            detailIbadah {
              id
              jam
              url
              pengkhotbah { nama }
              banner { url }
            }
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.jadwalIbadahs ?? [];
};

// 12. Riwayat Ibadah (jadwal sebelum tanggal tertentu, paginated)
export const fetchRiwayatIbadahAPI = async (
  before: string,
  take: number = 20,
  skip: number = 0,
) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetRiwayat($before: CalendarDay!, $take: Int!, $skip: Int!) {
          jadwalIbadahs(
            where: { tanggal: { lt: $before } }
            orderBy: { tanggal: desc }
            take: $take
            skip: $skip
          ) {
            id
            tanggal
            topik
            detailIbadah {
              id
              jam
              url
              pengkhotbah { nama }
              banner { url }
            }
          }
        }
      `,
      variables: { before, take, skip },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.jadwalIbadahs ?? [];
};

// 13. Fetch Data untuk Pencarian (Jadwal + Warta, metadata only — isiWarta di-load lazy)
export const fetchSearchDataAPI = async (): Promise<{
  jadwalIbadahs: any[];
  wartas: any[];
}> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          jadwalIbadahs(orderBy: { tanggal: desc }, take: 100) {
            id
            tanggal
            topik
            detailIbadah {
              id
              jam
              url
              pengkhotbah { nama }
              banner { url }
            }
          }
          wartas(orderBy: { masaBerlaku: desc }, take: 50) {
            id
            judul
            masaBerlaku
            tanggalPelaksanaan
            kategori { nama }
            gambar { url }
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return {
    jadwalIbadahs: json?.data?.jadwalIbadahs ?? [],
    wartas: json?.data?.wartas ?? [],
  };
};

// AUTH

// 14. Cek User (SSO - cek by googleId atau email)
export const checkUserAPI = async (
  googleId: string,
  email: string,
  token: string,
) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        query GetUser($googleId: String!, $email: String!) {
          users(where: {
            statusAktivasi: { equals: "aktif" },
            OR: [
              { googleId: { equals: $googleId } },
              { emailUser: { equals: $email } }
            ]
          }) {
            id
            googleId
            namaUser
          }
        }
      `,
      variables: { googleId, email },
    }),
  });
  const json = await res.json();
  if (!res.ok || json.errors)
    throw new Error(
      json.errors?.[0]?.message || "Gagal memverifikasi sesi ke server.",
    );
  return json?.data?.users?.[0];
};

// 15. Hubungkan Akun Google ke User yang ada
export const linkAccountAPI = async (
  userId: string,
  googleId: string,
  token: string,
) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation LinkAccount($id: ID!, $googleId: String!) {
          updateUser(where: { id: $id }, data: { googleId: $googleId }) {
            id
          }
        }
      `,
      variables: { id: userId, googleId },
    }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error("Gagal menghubungkan akun.");
};

// 16. Buat User Baru (Registrasi Otomatis via Google)
export const createUserAPI = async (
  data: { namaUser: string; emailUser: string; googleId: string },
  token: string,
) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation SyncUser($data: UserCreateInput!) {
          createUser(data: $data) {
            id
          }
        }
      `,
      variables: { data },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.createUser;
};
