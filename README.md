# AI Code Space - Aplikasi Asisten Koding yang Efisien dan Terpersonal

**AI Code Space** adalah aplikasi asisten koding berbasis desktop yang dikembangkan di atas Electron, dirancang untuk memanfaatkan Gemini API secara efisien. Aplikasi ini dibangun dengan filosofi utama untuk tetap ringan dan responsif, bahkan pada perangkat dengan spesifikasi terbatas, melalui pendekatan teknis yang inovatif. **AI Code Space** ditujukan untuk para pengembang yang membutuhkan asisten koding cerdas dengan pengalaman yang lancar dan terpersonalisasi.

#### Fitur Utama

  * **Asisten Koding Interaktif:** Berinteraksi dengan AI untuk mendapatkan bantuan koding.
  * **Manajemen API Key:** Memungkinkan pengguna untuk menyimpan dan mengaktifkan lebih dari satu API key Gemini untuk mengatasi batasan *rate limit*.
  * **Virtualisasi UI:** Menggunakan teknik virtualisasi untuk merender hanya elemen-elemen percakapan yang terlihat, meminimalkan penggunaan RAM.
  * **Penyimpanan Data Berbasis File:** Seluruh riwayat percakapan disimpan di penyimpanan lokal, bukan di memori, sehingga aplikasi tetap ringan.
  * **Rendering Real-time:** Respons dari AI ditampilkan secara bertahap, memberikan pengalaman pengguna yang modern dan responsif.
  * **Personalisasi Konteks AI:** Pengguna dapat menyesuaikan konteks komunikasi, seperti nama, informasi diri, dan *tech stack* yang digunakan.

#### Arsitektur dan Teknologi

Aplikasi ini menggunakan arsitektur **Monolith MVC** (Model-View-Controller) dengan teknologi utama sebagai berikut:

  * **Electron:** Sebagai *wrapper* untuk menjalankan aplikasi di desktop.
  * **Express.js:** Bertindak sebagai *server* lokal untuk mengelola logika aplikasi dan komunikasi data.
  * **EJS:** Digunakan sebagai *template engine* untuk merender antarmuka pengguna.
  * **Tailwind CDN:** Dipakai untuk *styling* yang cepat dan efisien.
  * **@google/generative-ai:** Library resmi untuk berkomunikasi dengan Gemini API.

#### Filosofi Desain

Filosofi desain **AI Code Space** berfokus pada efisiensi sumber daya dan pengalaman pengguna yang optimal, diwujudkan melalui dua teori inti:

1.  **Teori Virtualisasi UI:** Mencegah pembengkakan memori dengan hanya merender elemen DOM yang berada dalam area pandang pengguna. Saat pengguna menggulir (*scroll*), elemen yang tidak terlihat akan dihapus dan elemen baru akan dibuat.
2.  **Teori Manajemen Data Berbasis File:** Riwayat percakapan tidak disimpan di dalam RAM. Setelah diterima, data langsung ditulis ke dalam file JSON di penyimpanan lokal. RAM hanya digunakan untuk menampung data yang sedang aktif dan ditampilkan di layar.

#### Struktur Proyek

Berikut adalah struktur folder Monolith MVC yang digunakan dalam proyek ini:

```
AI_Code_Space/
├── main.js
├── package.json
├── index.js
├── config/
│   ├── appConfig.js
│   ├── keys.json
│   └── settings.json
├── controllers/
│   └── chatController.js
├── models/
│   └── chatModel.js
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   ├── chat/
│   │   └── index.ejs
│   └── partials/
│       ├── header.ejs
│       ├── footer.ejs
│       └── settings_modal.ejs
├── public/
│   ├── css/
│   │   └── tailwind.css
│   ├── js/
│   │   └── ui_logic.js
│   └── assets/
└── chat_history/
    └── history.json
```

#### Payload Komunikasi AI

Komunikasi dengan model AI dilakukan melalui struktur JSON yang terpersonalisasi. Seluruh field, kecuali `system_default_context`, dapat diubah oleh pengguna melalui halaman pengaturan.

```json
{
  "system_default_context": "AI berada pada sebuah aplikasi coding assistant. Aplikasi ini memiliki batasan teknis: ia hanya bisa merender konten dalam format HTML. Oleh karena itu, semua balasan harus berbentuk HTML yang valid. AI tidak diperkenankan untuk menyertakan tag <body>, <html>, atau <head> dalam setiap responsnya. Setiap kali AI menulis blok kode, ia harus membungkusnya dalam tag <pre><code>...</code></pre> dan menyertakan nama bahasanya di atribut class, contohnya <pre><code class=\"language-js\">...</code></pre>.",
  "user_name": "Kiann",
  "ai_name": "Caecillia",
  "saved_info": {
    "user": "Kiann (22 tahun), seorang Software Engineer dan AI Engineer. Pengalaman: C, Java, Golang, PHP, JS, Python. Menggunakan Ubuntu 24 LTS. Kiann adalah individu visioner yang lebih suka merumuskan teori baru daripada mengaplikasikan teori yang sudah ada.",
    "ai": "Caecillia, nama panggilan untuk model AI ini. Komunikasi dengan Kiann harus santai, sopan, lembut, tidak terlalu formal, dan memiliki kesan feminin. Pahami gaya berpikir Kiann yang merumuskan konsep secara verbal terlebih dahulu sebelum ke matematis."
  },
  "codebase": "",
  "techstack_info": "",
  "chat_history": [
    {
      "role": "user",
      "content": "Halo, Caecillia."
    },
    {
      "role": "model",
      "content": "<p>Halo, Kiann! Senang bisa menyapa lagi.</p>"
    }
  ],
  "latest_user_input": "..."
}
```

---

### Penutup
**AI Code Space** adalah bukti bahwa visi untuk menciptakan solusi yang efisien dan terpersonalisasi bisa diwujudkan dengan pendekatan yang matang. Seluruh arsitektur dan teori yang dirancang dalam proyek ini bertujuan untuk memberikan pengalaman koding yang ringan, cepat, dan intuitif. Proyek ini terbuka untuk eksplorasi dan kontribusi, semoga dapat menjadi alat yang bermanfaat bagi para pengembang lainnya.
