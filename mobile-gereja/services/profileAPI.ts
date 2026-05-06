import { API_URL } from "../utils/api";

const TIMEOUT_MS = 15_000;

async function gqlFetch(body: object, token?: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok || json.errors)
      throw new Error(json.errors?.[0]?.message ?? `HTTP ${res.status}`);
    return json.data;
  } finally {
    clearTimeout(timer);
  }
}

// TTL cache untuk data publik yang jarang berubah
const _cache = new Map<string, { data: any; exp: number }>();

async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = _cache.get(key);
  if (hit && Date.now() < hit.exp) return hit.data as T;
  const data = await fn();
  _cache.set(key, { data, exp: Date.now() + ttlMs });
  return data;
}

// 1. Ambil Data Profil
export const fetchUserProfileAPI = async (email: string, token: string) => {
  const data = await gqlFetch(
    {
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
    },
    token,
  );
  return data?.users?.[0];
};

// 2. Simpan / Update Profil
export const saveUserProfileAPI = async (
  userId: string,
  profileId: string | null,
  data: any,
  token: string,
) => {
  if (profileId) {
    const result = await gqlFetch(
      {
        query: `
          mutation UpdateProfile(
            $profileId: ID!
            $nama: String!
            $alamat: String
            $domisili: String
            $noWa: String
            $jk: String
            $pendidikan: String
            $pekerjaan: String
            $statusKawin: String
            $statusKeanggotaan: String
            $tglLahir: String
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
            ) { id }
          }
        `,
        variables: { profileId, ...data },
      },
      token,
    );
    return { id: userId, profile: { id: result.updateProfile.id } };
  }

  const result = await gqlFetch(
    {
      query: `
        mutation CreateProfile(
          $userId: ID!
          $nama: String!
          $alamat: String
          $domisili: String
          $noWa: String
          $jk: String
          $pendidikan: String
          $pekerjaan: String
          $statusKawin: String
          $statusKeanggotaan: String
          $tglLahir: String
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
          ) { id profile { id } }
        }
      `,
      variables: { userId, ...data },
    },
    token,
  );
  return result.updateUser;
};

// 3. Hapus Data Backend — soft delete + hard delete dijalankan paralel
export const deleteBackendDataAPI = async (
  userId: string | null,
  profileId: string | null,
  token: string,
  userEmail: string,
) => {
  const tasks: Promise<any>[] = [];

  if (userId && userEmail) {
    const deletedEmail = `deleted_${Date.now()}_${userEmail}`;
    tasks.push(
      gqlFetch(
        {
          query: `
            mutation SoftDeleteUser($id: ID!, $newEmail: String!) {
              updateUser(
                where: { id: $id }
                data: { statusAktivasi: "nonaktif", emailUser: $newEmail }
              ) { id }
            }
          `,
          variables: { id: userId, newEmail: deletedEmail },
        },
        token,
      ).catch((e) => {
        throw new Error("Gagal nonaktifkan User: " + e.message);
      }),
    );
  }

  if (profileId) {
    tasks.push(
      gqlFetch(
        {
          query: `
            mutation DeleteProfile($id: ID!) {
              deleteProfile(where: { id: $id }) { id }
            }
          `,
          variables: { id: profileId },
        },
        token,
      ).catch((e) => {
        throw new Error("Gagal hapus Profile: " + e.message);
      }),
    );
  }

  await Promise.all(tasks);
};

// 4. Cari ID User
export const findUserIdAPI = async (email: string, token: string) => {
  const data = await gqlFetch(
    {
      query: `
        query FindUser($email: String!) {
          users(where: { emailUser: { equals: $email } }) { id }
        }
      `,
      variables: { email },
    },
    token,
  );
  return data?.users?.[0]?.id;
};

// 5. Ambil Data Gereja (cached 1 jam)
export const fetchGerejaAPI = async () =>
  cached("gereja", 60 * 60_000, async () => {
    const data = await gqlFetch({
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
    });
    return data?.gerejas?.[0];
  });

// 6. Ambil Data Pendeta (cached 1 jam)
export const fetchPendetaAPI = async () =>
  cached("pendeta", 60 * 60_000, async () => {
    const data = await gqlFetch({
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
    });
    return data?.pendetas ?? [];
  });

// 7. Ambil Ayat Harian Terbaru (cached 1 jam)
export const fetchAyatHarianAPI = async () =>
  cached("ayat_harian", 60 * 60_000, async () => {
    const data = await gqlFetch({
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
    });
    return data?.ayatHarians?.[0] ?? null;
  });

// 8. Ambil Jadwal Rutin (cached 30 menit)
export const fetchJadwalRutinAPI = async () =>
  cached("jadwal_rutin", 30 * 60_000, async () => {
    const data = await gqlFetch({
      query: `
        query {
          jadwalRutins(orderBy: { namaIbadah: asc }) {
            id
            namaIbadah
            nama
            waktu { id jam }
          }
        }
      `,
    });
    return data?.jadwalRutins ?? [];
  });

// 9. Ambil Warta (take dikurangi ke 20 untuk kurangi beban)
export const fetchWartaAPI = async (take: number = 20, skip: number = 0) => {
  const data = await gqlFetch({
    query: `
      query GetWartas($take: Int!, $skip: Int!) {
        wartas(orderBy: { masaBerlaku: desc }, take: $take, skip: $skip) {
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
  });
  return data?.wartas ?? [];
};

// 9b. Ambil Isi Warta (lazy load saat user expand)
export const fetchWartaContentAPI = async (id: string) => {
  const data = await gqlFetch({
    query: `
      query GetWartaContent($id: ID!) {
        warta(where: { id: $id }) {
          isiWarta { document }
        }
      }
    `,
    variables: { id },
  });
  return data?.warta?.isiWarta ?? null;
};

// 10. Jadwal Ibadah Mendatang — pakai variables (bukan interpolasi)
export const fetchJadwalIbadahUpcomingAPI = async (
  fromDate: string,
  take: number,
) => {
  const data = await gqlFetch({
    query: `
      query GetUpcoming($fromDate: CalendarDay!, $take: Int!) {
        jadwalIbadahs(
          where: { tanggal: { gte: $fromDate } }
          orderBy: { tanggal: asc }
          take: $take
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
    variables: { fromDate, take },
  });
  return data?.jadwalIbadahs ?? [];
};

// 11. Jadwal Ibadah Rentang Tanggal — pakai variables (bukan interpolasi)
export const fetchJadwalIbadahRangeAPI = async (from: string, to: string) => {
  const data = await gqlFetch({
    query: `
      query GetRange($from: CalendarDay!, $to: CalendarDay!) {
        jadwalIbadahs(
          where: { tanggal: { gte: $from, lte: $to } }
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
    variables: { from, to },
  });
  return data?.jadwalIbadahs ?? [];
};

// 12. Riwayat Ibadah
export const fetchRiwayatIbadahAPI = async (
  before: string,
  take: number = 20,
  skip: number = 0,
) => {
  const data = await gqlFetch({
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
  });
  return data?.jadwalIbadahs ?? [];
};

// 13. Data Pencarian (cached 5 menit, payload dikurangi)
export const fetchSearchDataAPI = async (): Promise<{
  jadwalIbadahs: any[];
  wartas: any[];
}> =>
  cached("search_data", 5 * 60_000, async () => {
    const data = await gqlFetch({
      query: `
        query {
          jadwalIbadahs(orderBy: { tanggal: desc }, take: 50) {
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
          wartas(orderBy: { masaBerlaku: desc }, take: 30) {
            id
            judul
            masaBerlaku
            tanggalPelaksanaan
            kategori { nama }
            gambar { url }
          }
        }
      `,
    });
    return {
      jadwalIbadahs: data?.jadwalIbadahs ?? [],
      wartas: data?.wartas ?? [],
    };
  });

// 14. Cek User (SSO)
export const checkUserAPI = async (
  googleId: string,
  email: string,
  token: string,
) => {
  const data = await gqlFetch(
    {
      query: `
        query GetUser($googleId: String!, $email: String!) {
          users(where: {
            statusAktivasi: { equals: "aktif" }
            OR: [
              { googleId: { equals: $googleId } }
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
    },
    token,
  );
  return data?.users?.[0];
};

// 15. Hubungkan Akun Google
export const linkAccountAPI = async (
  userId: string,
  googleId: string,
  token: string,
) => {
  await gqlFetch(
    {
      query: `
        mutation LinkAccount($id: ID!, $googleId: String!) {
          updateUser(where: { id: $id }, data: { googleId: $googleId }) { id }
        }
      `,
      variables: { id: userId, googleId },
    },
    token,
  );
};

// 16. Buat User Baru
export const createUserAPI = async (
  data: { namaUser: string; emailUser: string; googleId: string },
  token: string,
) => {
  const result = await gqlFetch(
    {
      query: `
        mutation SyncUser($data: UserCreateInput!) {
          createUser(data: $data) { id }
        }
      `,
      variables: { data },
    },
    token,
  );
  return result?.createUser;
};
