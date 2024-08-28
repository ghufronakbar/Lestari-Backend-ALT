# Dokumentasi API
Sistem Pendataan Satwa (Lestari). Dokumentasi ini ditujukan untuk memudahkan developer selanjutnya untuk melakukan pengembangan.

## API ADMIN
Berikut merupakan group untuk endpoint dan method dalam HTTP untuk route khusus Admin. Untuk route admin diperlukan adanya verifikasi token yang didapat dari response login.

### Login
**POST /v1/web/login**

Berfungsi sebagai autentikasi untuk admin.

**Request Body:**
- `email`: string (Wajib) - Email untuk admin.
- `password`: string (Wajib) - Password untuk admin.

### Mendapatkan Daftar Satwa
**GET /v1/web/animals**

Berfungsi untuk menampilkan daftar seluruh satwa yang dikumpulkan oleh pengguna.

**Request Query:**
- `page`: integer (Opsional) - Nomor halaman untuk paginasi.
- `search`: string (Opsional) - Kata kunci pencarian untuk memfilter satwa.
- `date_start`: string (Opsional) - Filter tanggal mulai dalam format `YYYY-MM-DD`.
- `date_end`: string (Opsional) - Filter tanggal akhir dalam format `YYYY-MM-DD`.

---

### Mendapatkan Satwa Berdasarkan ID
**GET /v1/web/animal/:id**

Berfungsi untuk menampilkan detail animal yang telah dikumpulkan oleh pengguna. 

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik satwa.
---

### Menghapus Satwa Berdasarkan ID
**DELETE /v1/web/animal/delete/:id**

Berfungsi untuk menghapus satwa yang telah dikumpulkan oleh pengguna semisal jika ada kesalahan input.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik satwa.

---

### Mendapatkan Akun Permintaan
**GET /v1/web/request/accounts**

Berfungsi untuk mendapatkan semua data permintaan pembuatan akun untuk aplikasi Lestari.

**Request Query:**
- `page`: integer (Opsional) - Nomor halaman untuk paginasi.
- `search`: string (Opsional) - Kata kunci pencarian untuk memfilter akun permintaan.
- `approve`: integer (Opsional) - Filter berdasarkan status persetujuan (`0` untuk belum disetujui, `1` untuk disetujui).
- `date_start`: string (Opsional) - Filter tanggal mulai dalam format `YYYY-MM-DD`.
- `date_end`: string (Opsional) - Filter tanggal akhir dalam format `YYYY-MM-DD`.

---

### Mendapatkan Akun Permintaan Berdasarkan ID
**GET /v1/web/request/account/:id**

Berfungsi untuk mendapatkan detail data permintaan pembuatan akun untuk aplikasi Lestari.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik akun permintaan.

---

### Menyetujui Akun Permintaan
**PUT /v1/web/request/account/approve/:id**

Berfungsi untuk menyetujui/menolak pembuatan akun untuk aplikasi Lestari. Jika disetujui maka akan mengirimkan akun berupa email dan password yang akan dikirimkan di email yang tertera.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik akun permintaan.

**Request Body:**
- `approve`: integer (Wajib) - Status persetujuan (`0` untuk tidak disetujui, `1` untuk disetujui).

---

### Mendapatkan Data Permintaan
**GET /v1/web/request/datas**

Berfungsi untuk mendapatkan semua data permintaan data satwa pada aplikasi Lestari.

**Request Query:**
- `page`: integer (Opsional) - Nomor halaman untuk paginasi.
- `search`: string (Opsional) - Kata kunci pencarian untuk memfilter data permintaan.
- `date_start`: string (Opsional) - Filter tanggal mulai dalam format `YYYY-MM-DD`.
- `date_end`: string (Opsional) - Filter tanggal akhir dalam format `YYYY-MM-DD`.

---

### Mendapatkan Data Permintaan Berdasarkan ID
**GET /v1/web/request/data/:id**

Berfungsi untuk mendapatkan detail data permintaan data satwa pada aplikasi Lestari.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik data permintaan.

---

### Menyetujui Data Permintaan
**PUT /v1/web/request/data/approve/:id**

Berfungsi untuk menyetujui/menolak permintaan data satwa untuk aplikasi Lestari.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik data permintaan.

**Request Body:**
- `approve`: integer (Wajib) - Status persetujuan (`0` untuk tidak disetujui, `1` untuk disetujui).

---

### Mengirim Data Permintaan yang Disetujui
**POST /v1/web/request/data/approve/send**

Berfungsi untuk mengirim permintaan data oleh pengguna berdasarkan filter field data dan rentang data yang akan dikirimkan.

**Request Body:**
- `local_name`: integer (Opsional) - Sertakan nama lokal dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `latin_name`: integer (Opsional) - Sertakan nama latin dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `habitat`: integer (Opsional) - Sertakan habitat dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `description`: integer (Opsional) - Sertakan deskripsi dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `city`: integer (Opsional) - Sertakan kota dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `longitude`: integer (Opsional) - Sertakan garis bujur dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `latitude`: integer (Opsional) - Sertakan garis lintang dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `image`: integer (Opsional) - Sertakan gambar dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `amount`: integer (Opsional) - Sertakan jumlah dalam data yang disetujui (`0` untuk tidak, `1` untuk ya).
- `date_start`: string (Wajib) - Filter tanggal mulai dalam format `YYYY-MM-DD`.
- `date_end`: string (Wajib) - Filter tanggal akhir dalam format `YYYY-MM-DD`.
- `id_request_data`: integer (Wajib) - Identifikasi unik data permintaan.

---

### Mendapatkan Riwayat Data Permintaan
**GET /v1/web/history/request/data**

Berfungsi untuk mendapatkan semua data riwayat pengiriman data satwa pada aplikasi Lestari.

**Request Query:**
- `page`: integer (Opsional) - Nomor halaman untuk paginasi.
- `search`: string (Opsional) - Kata kunci pencarian untuk memfilter riwayat data permintaan.
- `date_start`: string (Opsional) - Filter tanggal mulai dalam format `YYYY-MM-DD`.
- `date_end`: string (Opsional) - Filter tanggal akhir dalam format `YYYY-MM-DD`.

---

### Mendapatkan Riwayat Data Permintaan Berdasarkan ID
**GET /v1/web/history/request/data/:id**

Berfungsi untuk mendapatkan detail data riwayat pengiriman data satwa pada aplikasi Lestari.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik riwayat data permintaan.

---

### Mendapatkan Daftar Pengguna
**GET /v1/web/users**

Berfungsi untuk mendapatkan semua data pengguna pada aplikasi Lestari.

**Request Query:**
- `page`: integer (Opsional) - Nomor halaman untuk paginasi.
- `search`: string (Opsional) - Kata kunci pencarian untuk memfilter pengguna.
- `status`: integer (Opsional) - Filter berdasarkan status pengguna (`0` untuk tidak aktif, `1` untuk aktif).

---

### Mendapatkan Pengguna Berdasarkan ID
**GET /v1/web/user/:id**

Berfungsi untuk mendapatkan detail data pengguna pada aplikasi Lestari.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik pengguna.

---

### Menangguhkan Pengguna
**PUT /v1/web/user/suspend**

Berfungsi untuk melakukan penangguhan atau melepaskan penangguhan status akun pengguna.

**Request Body:**
- `id`: integer (Wajib) - Identifikasi unik pengguna.
- `status`: integer (Wajib) - Status baru pengguna (`0` untuk tidak aktif, `1` untuk aktif).


---


### Mendapatkan Daftar Admin
**GET /v1/web/admins**

Berfungsi untuk mendapatkan data seluruh admin yang terdaftar pada aplikasi Lestari.

**Request Query:**
- `page`: integer (Opsional) - Nomor halaman untuk paginasi.
- `search`: string (Opsional) - Kata kunci pencarian untuk memfilter admin.
- `date_start`: string (Opsional) - Filter tanggal mulai dalam format `YYYY-MM-DD`.
- `date_end`: string (Opsional) - Filter tanggal akhir dalam format `YYYY-MM-DD`.


---

### Membuat Akun Admin
**POST /v1/web/create-account**

Berfungsi untuk membuat akun admin dan hanya super admin yang dapat melakukan manage data admin.

**Request Body:**
- `name`: string (Wajib) - Nama admin baru.
- `email`: string (Wajib) - Email admin baru.


---

### Menghapus Admin
**DELETE /v1/web/admin/delete/:id**

Berfungsi untuk menghapus akun admin dan hanya super admin yang dapat melakukan manage data admin.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik admin.

---


### Profil Admin
**GET /v1/web/admin/profile**

Berfungsi untuk mendapatkan data akun admin berdasarkan admin autentikasi login yang ada.

**Request Decoded:**
- `id_admin`: integer (Wajib) - Identifikasi unik admin.

---


### Mengedit Admin
**PUT /v1/web/admin/edit**

Berfungsi untuk mengedit akun admin berdasarkan admin autentikasi login yang ada.

**Request Decoded:**
- `id_admin`: integer (Wajib) - Identifikasi unik admin.

**Request Body:**
- `name`: string (Opsional) - Nama baru admin.
- `password`: string (Opsional) - Kata sandi baru admin.
- `confirmation_password`: string (Opsional) - Konfirmasi kata sandi baru.

---

### Mendapatkan Semua Saran
**GET /v1/web/suggestions**

Berfungsi untuk mendapatkan semua data saran untuk input data satwa pengguna yang telah diinputkan oleh admin.

**Request Query:**
- `page`: integer (Opsional) - Nomor halaman untuk paginasi.
- `search`: string (Opsional) - Kata kunci pencarian untuk memfilter saran.

---

### Membuat Saran
**POST /v1/web/suggestions**

Berfungsi untuk membuat data saran untuk input data satwa pengguna.

**Request Body:**
- `local_name`: string (Wajib) - Nama lokal saran.
- `latin_name`: string (Wajib) - Nama ilmiah saran.

---

### Mengedit Saran
**PUT /v1/web/suggestions/:id**

Berfungsi untuk mengedit data saran untuk input data satwa pengguna.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik saran.

**Request Body:**
- `local_name`: string (Opsional) - Nama lokal baru saran.
- `latin_name`: string (Opsional) - Nama ilmiah baru saran.

---

### Menghapus Saran
**DELETE /v1/web/suggestions/:id**

Berfungsi untuk menghapus data saran untuk input data satwa pengguna.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik saran.

---


### Reset Password
**POST /v1/web/reset-password**

Berfungsi untuk melakukan reset password admin jika admin lupa password setelah itu akan dikirimkan ke email admin.

**Request Body:**
- `email`: string (Wajib) - Email admin yang meminta reset kata sandi.

---

### Verifikasi Akun
**GET /v1/web/verify-account/:token**

Berfungsi untuk melakukan verifikasi reset password admin dan password akan dikirimkan melalui email.

**Request Params:**
- `token`: string (Wajib) - Token verifikasi yang dikirim ke admin.

---

## API PENGGUNA

Berikut merupakan group untuk endpoint dan method dalam HTTP untuk route khusus pengguna. Untuk route pengguna diperlukan adanya verifikasi token yang didapat dari response login.

### Login Pengguna
**POST /v1/mob/user/login**

Berfungsi untuk autentikasi pengguna untuk masuk ke dalam aplikasi Lestari.

**Request Body:**
- `email`: string (Wajib) - Email pengguna.
- `password`: string (Wajib) - Kata sandi pengguna.

---

### Memeriksa Pengguna
**GET /v1/mob/user/check**

Berfungsi untuk melakukan cek autentikasi pengguna dengan autentikasi. 

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---


### Mendapatkan Akun Pengguna
**GET /v1/mob/user/account**

Berfungsi untuk menampilkan data profil berdasarkan dari autentikasi pengguna.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Mengedit Nama Akun Pengguna
**PUT /v1/mob/user/account/edit/name**

Berfungsi untuk mengedit nama pengguna berdasarkan dari autentikasi pengguna.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `name`: string (Wajib) - Nama baru pengguna.

---

### Mengedit Foto Profil Pengguna
**PUT /v1/mob/user/account/edit/picture**

Berfungsi untuk mengedit foto profil berdasarkan dari autentikasi pengguna.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `image`: file (Wajib) - Foto profil baru pengguna (multipart/form-data).

---

### Mengedit Kata Sandi Akun Pengguna
**PUT /v1/mob/user/account/edit/password**

Berfungsi untuk mengedit kata sandi berdasarkan dari autentikasi pengguna.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `old_password`: string (Wajib) - Kata sandi saat ini pengguna.
- `new_password`: string (Wajib) - Kata sandi baru pengguna.

---


### Memeriksa Kata Sandi Pengguna
**POST /v1/mob/user/check-password**

Berfungsi untuk melakukan pemeriksaan terhadap kata sandi pengguna.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `password`: string (Wajib) - Kata sandi yang akan diperiksa.

---

### Mengatur Kata Sandi Baru
**PUT /v1/mob/user/new_password**

Berfungsi untuk melakukan pengeditan terhadap kata sandi pengguna.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `new_password`: string (Wajib) - Kata sandi baru untuk pengguna.

---

### Mendapatkan Satwa yang Dapat Diedit
**GET /v1/mob/animals/editable**

Berfungsi untuk menampilkan semua data satwa berdasar autentikasi pengguna yang dapat diedit (masih dalam kurun waktu 7 hari). 

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Mendapatkan Satwa Berdasarkan ID untuk Pengguna
**GET /v1/mob/animal/:id**

Berfungsi untuk menampilkan detail data satwa berdasar autentikasi pengguna yang dapat diedit (masih dalam kurun waktu 7 hari). 

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik satwa.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Menambahkan Satwa
**POST /v1/mob/animal/add**

Berfungsi untuk menambahkan data satwa ke aplikasi Lestari. 

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `local_name`: string (Wajib) - Nama lokal satwa.
- `latin_name`: string (Wajib) - Nama ilmiah satwa.
- `habitat`: string (Wajib) - Habitat satwa.
- `description`: string (Wajib) - Deskripsi satwa.
- `city`: string (Wajib) - Kota tempat satwa ditemukan.
- `longitude`: float (Wajib) - Garis bujur geografis lokasi satwa.
- `latitude`: float (Wajib) - Garis lintang geografis lokasi satwa.
- `image`: string (Wajib) - URL dari response upload image satwa.
- `amount`: integer (Wajib) - Jumlah atau kuantitas satwa.

---

### Mengedit Satwa Berdasarkan ID (tanpa gambar)
**PUT /v1/mob/animal/editable/edit/:id**

Berfungsi untuk mengedit data satwa yang telah diinputkan oleh pengguna yang masih dapat diedit. 

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik satwa.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `local_name`: string (Opsional) - Nama lokal baru satwa.
- `latin_name`: string (Opsional) - Nama ilmiah baru satwa.
- `habitat`: string (Opsional) - Habitat baru satwa.
- `description`: string (Opsional) - Deskripsi baru satwa.
- `city`: string (Opsional) - Kota baru tempat satwa ditemukan.
- `longitude`: float (Opsional) - Garis bujur geografis baru lokasi satwa.
- `latitude`: float (Opsional) - Garis lintang geografis baru lokasi satwa.
- `amount`: integer (Opsional) - Jumlah baru atau kuantitas satwa.
- `image`: string (Wajib) - URL dari response upload image satwa.

---

### Menghapus Satwa Berdasarkan ID untuk Pengguna
**DELETE /v1/mob/animal/editable/delete/:id**

Berfungsi untuk menghapus data satwa yang telah diinputkan oleh pengguna yang masih dapat diedit. 

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik satwa.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Mengunggah Gambar Satwa
**POST /v1/mob/animal/upload/image**

Berfungsi untuk mengupload gambar satwa dengan menghasilkan response image_url.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `image`: file (Wajib) - File gambar yang akan diunggah (multipart/form-data).

---

### Menghapus Gambar Satwa Berdasarkan URL
**DELETE /v1/mob/animal/delete/image**

Berfungsi untuk menghapus gambar satwa dengan memerlukan request image_url dari data satwa yang akan dihapus.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `imageUrl`: string (Wajib) - URL gambar yang akan dihapus.

---

### Mendapatkan Riwayat Satwa
**GET /v1/mob/animals/history**

Berfungsi untuk menampilkan semua data satwa berdasar autentikasi pengguna. 

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Mendapatkan Riwayat Satwa Berdasarkan ID
**GET /v1/mob/animal/history/:id**

Berfungsi untuk menampilkan detail data satwa berdasar autentikasi pengguna.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik satwa.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Mendapatkan Data Permintaan untuk Pengguna
**GET /v1/mob/user/request-datas**

Berfungsi untuk mendapatkan semua data permintaan berdasarkan autentikasi pengguna.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Mendapatkan Data Permintaan Berdasarkan ID untuk Pengguna
**GET /v1/mob/user/request-data/:id**

Berfungsi untuk mendapatkan detaik data permintaan berdasarkan autentikasi pengguna.

**Request Params:**
- `id`: integer (Wajib) - Identifikasi unik data permintaan.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Menambahkan Data Permintaan
**POST /v1/mob/user/request-data/add**

Berfungsi untuk melakukan permintaan data satwa pada aplikasi Lestari.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

---

### Mengunggah Lampiran untuk Data Permintaan
**POST /v1/mob/user/request-data/add/attachment**

Berfungsi untuk mengunggah gambar untuk permintaan data satwa pada aplikasi Lestari.

**Request Decoded:**
- `id_user`: integer (Wajib) - Identifikasi unik pengguna.

**Request Body:**
- `image`: file (Wajib) - File gambar yang akan diunggah (multipart/form-data).


---

### Menampilkan Saran
**GET /v1/mob/user/suggestion**

Berfungsi untuk menampilkan saran untuk memasukkan data satwa pada kolom local_name dan latin_name.

**Request Query:**
- `q`: string (Opsional) - Kata kunci pencarian untuk memfilter saran.

---

## API GUEST
Berikut merupakan group untuk endpoint dan method dalam HTTP untuk route yang tidak memiliki akun.

### Registrasi Pengguna
**POST /v1/mob/user/register**

Berfungsi untuk melakukan permintaan pembuatan akun untuk aplikasi Lestari.

**Request Body:**
- `name`: string (Wajib) - Nama pengguna.
- `email`: string (Wajib) - Email pengguna.
- `phone`: string (Wajib) - Nomor telepon pengguna.
- `profession`: string (Wajib) - Profesi pengguna.
- `instances`: string (Wajib) - Instansi atau organisasi yang terkait dengan pengguna.
- `kepentingan`: string (Wajib) - Tujuan atau kepentingan pengguna.
- `deskripsi`: string (Wajib) - Deskripsi atau informasi tambahan.

---

### Lupa Kata Sandi
**POST /v1/web/user/forgot-password**

Berfungsi untuk melakukan permintaan pengatur ulang password. Untuk permintaan pertama kirim request untuk OTP kosong. Jika sudah mendapatkan kirim OTP untuk mendapatkan password baru.

**Request Body:**
- `email`: string (Wajib) - Email pengguna.
- `otp`: string (Wajib setelah mendapatkan OTP) - One-time password (OTP) untuk verifikasi.

---

### Permintaan Data Untuk Guest
**POST /v1/web/user/request-data**

Berfungsi untuk melakukan permintaan data satwa untuk pengguna yang belum menjadi/tidak memiliki akun Lestari.

**Request Body:**
- `name`: string (Wajib) - Nama pengirim.
- `email`: string (Wajib) - Email pengirim.
- `profession`: string (Wajib) - Profesi pengirim.
- `instances`: string (Wajib) - Instansi atau organisasi yang terkait dengan pengirim.
- `subject`: string (Wajib) - Subjek pengirim.
- `body`: string (Wajib) - Isi atau konten permintaan pengirim.
- `attachment`: string (Wajib) - Berupa url file dari response unggahan.

---

### Mengunggah Lampiran untuk Data Permintaan Tamu
**POST /v1/web/user/request-data/attachment**

Berfungsi untuk menggunggah lampiran permintaan data satwa untuk pengguna yang belum menjadi/tidak memiliki akun Lestari.

**Request Body:**
- `image`: file (Wajib) - File gambar yang akan diunggah (multipart/form-data).
