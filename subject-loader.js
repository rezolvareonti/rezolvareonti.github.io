(function () {
    const tabCandidates = {
        subject: ['subiect.txt', 'subiect.md', 'subiect.html', 'subject.txt', 'subject.md', 'subject.html'],
        barem: ['barem.txt', 'barem.md', 'barem.html', 'barem.pdf'],
        solution: ['rezolvare.txt', 'rezolvare.md', 'rezolvare.html', 'rezolvare.pdf', 'solutie.txt', 'solutie.md'],
        resources: ['resurse.txt', 'resurse.md', 'resurse.html']
    };

    const fallbackMarkup = (title, message) => `
        <div class="bg-amber-50 border border-amber-200 p-6 rounded-lg">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">${title}</h2>
            <p class="text-gray-700">${message}</p>
        </div>
    `;

    const escapeHtml = (value) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const renderTextContent = async (tabId, fileName, content) => {
        const container = document.getElementById(tabId);
        if (!container) return;

        const fileUrl = new URL(fileName, new URL('.', window.location.href));
        const safeContent = escapeHtml(content).replace(/\n/g, '<br>');

        container.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 class="text-2xl font-bold text-gray-900">Conținut încărcat din folder</h2>
                    <a href="${fileUrl}" class="text-sm text-blue-600 font-semibold hover:text-blue-700" download>Descarcă fișierul</a>
                </div>
                <div class="prose max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">${safeContent}</div>
            </div>
        `;
    };

    const renderBinaryContent = async (tabId, fileName) => {
        const container = document.getElementById(tabId);
        if (!container) return;

        const fileUrl = new URL(fileName, new URL('.', window.location.href));
        const title = tabId === 'barem' ? 'Baremul oficial' : 'Fișier disponibil';
        const description = tabId === 'barem'
            ? 'Acest barem este afișat direct din folderul paginii.'
            : 'S-a găsit un fișier pentru această secțiune.';

        container.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">${title}</h2>
                        <p class="text-gray-600 mt-1">${description}</p>
                    </div>
                    <a href="${fileUrl}" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition-all" download>
                        <i class="fa-solid fa-download"></i>Descarcă
                    </a>
                </div>
                <div class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-2">
                    <iframe src="${fileUrl}" title="Vizualizare PDF" class="w-full min-h-[700px] rounded-md bg-white"></iframe>
                </div>
                <div class="mt-4 text-center">
                    <a href="${fileUrl}" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold" download>
                        <i class="fa-solid fa-download"></i>Descarcă
                    </a>
                </div>
            </div>
        `;
    };

    const loadTabContent = async (tabId) => {
        const container = document.getElementById(tabId);
        if (!container) return;

        const candidates = tabCandidates[tabId] || [];
        const folderUrl = new URL('.', window.location.href);

        for (const fileName of candidates) {
            try {
                const response = await fetch(new URL(fileName, folderUrl), { cache: 'no-store' });
                if (!response.ok) continue;

                const contentType = response.headers.get('content-type') || '';
                const isBinary = contentType.includes('application/pdf') || fileName.toLowerCase().endsWith('.pdf');

                if (isBinary) {
                    await renderBinaryContent(tabId, fileName);
                    return;
                }

                const text = await response.text();
                await renderTextContent(tabId, fileName, text);
                return;
            } catch (error) {
                // continue to the next candidate
            }
        }

        container.innerHTML = fallbackMarkup(
            'Conținutul nu este încă disponibil',
            'Adaugă un fișier în folderul acestei pagini pentru a-l afișa automat aici.'
        );
    };

    const initializeLoader = async () => {
        const tabs = ['subject', 'barem', 'solution', 'resources'];
        for (const tabId of tabs) {
            await loadTabContent(tabId);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLoader);
    } else {
        initializeLoader();
    }
})();
