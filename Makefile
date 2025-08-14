# Makefile for AI Code Space

# Target untuk mengekspor daftar codebase LENGKAP DENGAN ISI FILE.
# Perintah ini akan:
# 1. Membuat direktori z_listing jika belum ada.
# 2. Mencari semua file yang relevan, menyaring yang tidak perlu.
# 3. Menggunakan 'xargs' untuk memproses setiap file:
#    a. Mencetak header yang berisi path file.
#    b. Mencetak seluruh isi file menggunakan 'cat'.
# 4. Menyimpan semua output gabungan ke z_listing/listing.txt.
export-list:
	@mkdir -p z_listing
	@echo "Membuat daftar codebase lengkap dengan isinya..."
	@find . -type f | sed 's|^\./||' | grep -vE '^(node_modules/|z_listing/|\.vscode/|\.git/|\.gitignore|Makefile|package-lock\.json)' | \
	xargs -I {} sh -c 'echo "\n\n# ==================================================\n# FILE: {}\n# ==================================================\n"; cat {};' > z_listing/listing.txt
	@echo "Daftar codebase lengkap telah diekspor ke z_listing/listing.txt"

.PHONY: export-list