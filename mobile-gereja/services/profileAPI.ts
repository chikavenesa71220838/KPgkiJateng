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
          }
        }
      }
    `,
    variables: { email },
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
  token: string
) => {
  const profileMutationAction = profileId ? `update: {` : `create: {`;

  const mutation = {
    query: `
      mutation UpdateUserAndProfile(
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
        $tglLahir: String
      ) {
        updateUser(
          where: { id: $userId }
          data: {
            profile: {
              ${profileMutationAction}
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
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
  userEmail: string
) => {
  // Soft Delete User & Samarkan Email
  if (userId && userEmail) {
    // Membuat email unik agar tidak bentrok jika user mendaftar lagi
    const timestamp = Date.now();
    const deletedEmail = `deleted_${timestamp}_${userEmail}`;

    const res1 = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    if (json1.errors) throw new Error("Gagal nonaktifkan User: " + json1.errors[0].message);
  }

  // Hard Delete Profile (Biarin ke-delete selamanya karena nanti buat baru)
  if (profileId) {
    const res2 = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: `mutation DeleteProfile($id: ID!) { 
          deleteProfile(where: { id: $id }) { id } 
        }`,
        variables: { id: profileId },
      }),
    });

    const json2 = await res2.json();
    if (json2.errors) throw new Error("Gagal hapus Profile: " + json2.errors[0].message);
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
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(query),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json?.data?.users?.[0]?.id;
};