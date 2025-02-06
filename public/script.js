/*
* ··········································································
* :   __    __     ______     ______     ______                            :
* :  /\ "-./  \   /\  ___\   /\  == \   /\__  _\                           :
* :  \ \ \-./\ \  \ \  __\   \ \  __<   \/_/\ \/                           :
* :   \ \_\ \ \_\  \ \_____\  \ \_\ \_\    \ \_\                           :
* :    \/_/  \/_/   \/_____/   \/_/ /_/     \/_/                           :
* :                                                                        :
* :   __  __     ______     __  __     __     __  __     ______     __     :
* :  /\ \/ /    /\  __ \   /\ \_\ \   /\ \   /\ \/ /    /\  ___\   /\ \    :
* :  \ \  _"-.  \ \  __ \  \ \____ \  \ \ \  \ \  _"-.  \ \ \____  \ \ \   :
* :   \ \_\ \_\  \ \_\ \_\  \/\_____\  \ \_\  \ \_\ \_\  \ \_____\  \ \_\  :
* :    \/_/\/_/   \/_/\/_/   \/_____/   \/_/   \/_/\/_/   \/_____/   \/_/  :
* ··········································································
*
  mert(at)kayikci.dev - 2025
*
*/

// Global değişkenler
let editor = null;
let currentFilePath = null;
let selectedXmlData = null;
let currentLanguage = localStorage.getItem('language') || 'tr';
let languageSelector = null;
let languageOptions = null;
let currentSearchResults = [];
let currentSearchIndex = -1;

// Dil çevirileri
const translations = {
    tr: {
        title: "XSLT Web Editörü",
        newFile: "Yeni XSLT Dosyası",
        openFile: "XSLT Dosyası Seç",
        parseFromXml: "XML'den Dizayn Ayrıştır",
        advancedOptions: "Gelişmiş Seçenekler",
        selectXmlData: "XML Veri Dosyası Seç",
        codedWith: "🤩 ile kodladı."
    },
    en: {
        title: "XSLT Invoice Design Editor",
        newFile: "New XSLT File",
        openFile: "Select XSLT File",
        parseFromXml: "Parse from XML",
        advancedOptions: "Advanced Options",
        selectXmlData: "Select XML Data File",
        codedWith: "coded with 🤩"
    },
    de: {
        title: "XSLT Rechnungs Design Editor",
        newFile: "Neue XSLT Datei",
        openFile: "XSLT Datei auswählen",
        parseFromXml: "Aus XML parsen",
        advancedOptions: "Erweiterte Optionen",
        selectXmlData: "XML Datendatei auswählen",
        codedWith: "codiert mit 🤩"
    },
    ru: {
        title: "Редактор дизайна счетов XSLT",
        newFile: "Новый файл XSLT",
        openFile: "Выбрать файл XSLT",
        parseFromXml: "Разобрать из XML",
        advancedOptions: "Расширенные настройки",
        selectXmlData: "Выбрать файл данных XML",
        codedWith: "написано с 🤩"
    },
    zh: {
        title: "XSLT发票设计编辑器",
        newFile: "新建XSLT文件",
        openFile: "选择XSLT文件",
        parseFromXml: "从XML解析",
        advancedOptions: "高级选项",
        selectXmlData: "选择XML数据文件",
        codedWith: "编写与 🤩"
    }
};

// UI metinlerini güncelleme fonksiyonu
function updateUITexts() {
    const texts = translations[currentLanguage];
    if (!texts) return;

    document.querySelectorAll('[data-translation-key]').forEach(element => {
        const key = element.dataset.translationKey;
        if (texts[key]) {
            element.textContent = texts[key];
        }
    });

    document.documentElement.setAttribute('lang', currentLanguage);
}

// Dil değiştirme fonksiyonu
function changeLanguage(lang) {
    if (!translations[lang]) return;
    
    // Dili güncelle ve kaydet
    currentLanguage = lang;
    try {
        localStorage.setItem('selectedLanguage', lang);
        console.log('Dil kaydedildi:', lang);
    } catch (e) {
        console.error('LocalStorage kayıt hatası:', e);
    }
    
    // Aktif dil seçeneğini güncelle
    languageOptions.forEach(option => {
        const isActive = option.dataset.lang === lang;
        option.classList.toggle('active', isActive);
    });
    
    // UI metinlerini güncelle
    updateUITexts();

    // Başarılı dil değişikliği mesajı göster
    showToast(`Dil ${translations[lang].title.split(' ')[0]} olarak değiştirildi`, 'success');
}

// Dil seçimi işleme fonksiyonu
function handleLanguageSelection(e) {
    const isOption = e.target.closest('.language-option');
    
    if (isOption) {
        const lang = isOption.dataset.lang;
        if (lang !== currentLanguage) {
            changeLanguage(lang);
        }
    }
}

// Dil başlatma fonksiyonu
function initializeLanguage() {
    // Dil seçimi elementlerini seç
    languageSelector = document.querySelector('.language-selector');
    languageOptions = document.querySelectorAll('.language-option');

    // LocalStorage'dan dil tercihini kontrol et
    try {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        console.log('Kaydedilmiş dil:', savedLanguage);
        
        if (savedLanguage && translations[savedLanguage]) {
            currentLanguage = savedLanguage;
            console.log('Kaydedilmiş dil yüklendi:', currentLanguage);
        } else {
            // Eğer kayıtlı dil yoksa veya geçersizse Türkçe'yi kaydet
            localStorage.setItem('selectedLanguage', 'tr');
            currentLanguage = 'tr';
            console.log('Varsayılan dil ayarlandı: tr');
        }
    } catch (e) {
        console.error('LocalStorage okuma hatası:', e);
        currentLanguage = 'tr'; // Hata durumunda varsayılan dil
    }

    // Aktif dil seçeneğini işaretle
    languageOptions.forEach(option => {
        const isActive = option.dataset.lang === currentLanguage;
        option.classList.toggle('active', isActive);
    });
    
    // UI metinlerini güncelle
    updateUITexts();
    
    // HTML lang attribute'unu güncelle
    document.documentElement.setAttribute('lang', currentLanguage);

    // Dil seçici için event listener
    if (languageSelector) {
        languageSelector.addEventListener('click', handleLanguageSelection);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Başlangıç dilini ayarla
    initializeLanguage();

    // XML'den ayrıştır butonu
    const parseFromXmlBtn = document.getElementById('parseFromXml');
    if (parseFromXmlBtn) {
        parseFromXmlBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xml';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await handleXMLFileSelect(file);
                }
            };
            input.click();
        });
    }

    // Yıl güncellemesi
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // İmza container ve emoji efektleri
    const signatureContainer = document.querySelector('.signature-container');
    const emojiParticles = document.querySelector('.emoji-particles');

    if (signatureContainer && emojiParticles) {
        signatureContainer.addEventListener('mousemove', (e) => {
            if (Math.random() > 0.8) {
                const emoji = document.createElement('div');
                emoji.textContent = '🤩';
                emoji.style.position = 'absolute';
                emoji.style.left = `${e.offsetX}px`;
                emoji.style.top = `${e.offsetY}px`;
                emoji.style.fontSize = '20px';
                emoji.style.pointerEvents = 'none';
                emoji.style.animation = 'floatingEmoji 2s ease-out forwards';
                emoji.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
                emoji.style.setProperty('--y', '-100px');
                emoji.style.setProperty('--r', `${Math.random() * 90 - 45}deg`);
                
                emojiParticles.appendChild(emoji);
                setTimeout(() => {
                    emojiParticles.removeChild(emoji);
                }, 2000);
            }
        });
    }

    // Modal işlevselliği
    const modal = document.getElementById('contactModal');
    const signature = document.getElementById('signature');
    const span = document.getElementsByClassName("close")[0];

    if (signature && modal && span) {
    signature.onclick = function() {
        modal.style.display = "block";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            }
        }
    }

    // Particles.js initialization
    // Particles.js başlatma
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }
    const welcomePopup = document.getElementById('welcome-popup');
    const container = document.querySelector('.container');
    const newFileBtn = document.getElementById('newFile');
    const openFileBtn = document.getElementById('openFile');
    const fileInput = document.getElementById('fileInput');
    const saveFileBtn = document.getElementById('saveFile');
    let expandedEditor;

    // Modal elementlerini seç
    const newFileModal = document.getElementById('newFileModal');
    const closeNewFileModal = document.getElementById('closeNewFileModal');
    const cancelNewFile = document.getElementById('cancelNewFile');
    const confirmNewFile = document.getElementById('confirmNewFile');

    // Modal butonları için event listener'lar
    if (closeNewFileModal) {
        closeNewFileModal.addEventListener('click', () => {
            console.log('Modal kapatma butonu tıklandı');
            newFileModal.style.display = 'none';
        });
    }

    if (cancelNewFile) {
        cancelNewFile.addEventListener('click', () => {
            console.log('Modal iptal butonu tıklandı');
            newFileModal.style.display = 'none';
        });
    }

    if (confirmNewFile) {
        confirmNewFile.addEventListener('click', () => {
            console.log('Modal onay butonu tıklandı');
            newFileModal.style.display = 'none';
            welcomePopup.style.display = 'flex';
            container.style.display = 'none';
            if (editor) {
                editor.setValue('');
                editor.clearSelection();
                editor.moveCursorTo(0, 0);
            }
            currentFilePath = null;
            updateTitle();
        });
    }

    // ESC tuşu ile modalı kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && newFileModal.style.display === 'flex') {
            newFileModal.style.display = 'none';
        }
    });

    fileInput.setAttribute('accept', '.xslt,.xsl');

    // Varsayılan XSLT şablonu
    const defaultXSLT = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
    xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
    xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
    exclude-result-prefixes="cac cbc">

        <!--

          /\\_/\\  
         ( o.o ) 
          > ^ <
        *************************************
        *        mert@kayikci.dev           *
        *************************************

        -->   

    <xsl:output method="html" indent="yes"/>

    <xsl:template match="/">
        <html>
            <head>
            <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                th { background-color: #f2f2f2; }
            </style>
            </head>
            <body>
            <h2>Fatura Bilgileri</h2>
            <table>
                <tr><th>Fatura Numarası</th><td><xsl:value-of select="/ubl:Invoice/cbc:ID"/></td></tr>
                <tr><th>Fatura Tarihi</th><td><xsl:value-of select="/ubl:Invoice/cbc:IssueDate"/></td></tr>
                <tr><th>Satıcı</th><td><xsl:value-of select="/ubl:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name"/></td></tr>
                <tr><th>Alıcı</th><td><xsl:value-of select="/ubl:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name"/></td></tr>
            </table>
            <h3>Kalemler</h3>
            <table>
                <tr>
                    <th>Kalem ID</th>
                    <th>Ürün Adı</th>
                    <th>Miktar</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                </tr>
                <xsl:for-each select="/ubl:Invoice/cac:InvoiceLine">
                    <tr>
                        <td><xsl:value-of select="cbc:ID"/></td>
                        <td><xsl:value-of select="cac:Item/cbc:Name"/></td>
                        <td><xsl:value-of select="cbc:InvoicedQuantity"/></td>
                        <td><xsl:value-of select="cac:Price/cbc:PriceAmount"/></td>
                        <td><xsl:value-of select="cbc:LineExtensionAmount"/></td>
                    </tr>
                </xsl:for-each>
            </table>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>`;

    // Başlangıçta varsayılan XML verisi yok. XML seçilmesi zorunludur.
    selectedXmlData = `<?xml version="1.0" encoding="UTF-8"?> <!--#!DFLT_XML!#--> <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"	         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"	         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">	    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>	    <cbc:CustomizationID>TR1.2</cbc:CustomizationID>	    <cbc:ProfileID>TESTFATURA</cbc:ProfileID>	    <cbc:ID>FTR20250001</cbc:ID>	    <cbc:IssueDate>2050-10-15</cbc:IssueDate>	    <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>	    <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>	    <cbc:LineCountNumeric>1</cbc:LineCountNumeric>		    <!-- Gönderen Bilgileri -->	    <cac:AccountingSupplierParty>	        <cac:Party>	            <cbc:WebsiteURI>www.kayikci.dev</cbc:WebsiteURI>	            <cac:PartyIdentification>	                <cbc:ID schemeID="VKN">99999999999</cbc:ID>	            </cac:PartyIdentification>	            <cac:PartyName>	                <cbc:Name>XSLT Web Editor</cbc:Name>	            </cac:PartyName>	            <cac:PostalAddress>	                <cbc:StreetName>Örnek Sokak No: 123</cbc:StreetName>	                <cbc:CitySubdivisionName>Çankaya</cbc:CitySubdivisionName>	                <cbc:CityName>Ankara</cbc:CityName>	                <cbc:PostalZone>06100</cbc:PostalZone>	                <cac:Country>	                    <cbc:Name>Türkiye</cbc:Name>	                </cac:Country>	            </cac:PostalAddress>	        </cac:Party>	    </cac:AccountingSupplierParty>		    <!-- Alıcı Bilgileri -->	    <cac:AccountingCustomerParty>	        <cac:Party>	            <cac:PartyIdentification>	                <cbc:ID schemeID="TCKN">99999999999</cbc:ID>	            </cac:PartyIdentification>	            <cac:PartyName>	                <cbc:Name>Örnek Müşteri</cbc:Name>	            </cac:PartyName>	            <cac:PostalAddress>	                <cbc:StreetName>Diğer Sokak No: 456</cbc:StreetName>	                <cbc:CitySubdivisionName>Kadıköy</cbc:CitySubdivisionName>	                <cbc:CityName>İstanbul</cbc:CityName>	                <cbc:PostalZone>34700</cbc:PostalZone>	                <cac:Country>	                    <cbc:Name>Türkiye</cbc:Name>	                </cac:Country>	            </cac:PostalAddress>	        </cac:Party>	    </cac:AccountingCustomerParty>		    <!-- Fatura Kalemleri -->	    <cac:InvoiceLine>	        <cbc:ID>1</cbc:ID>	        <cbc:InvoicedQuantity unitCode="C62">10</cbc:InvoicedQuantity>	        <cbc:LineExtensionAmount currencyID="TRY">100.00</cbc:LineExtensionAmount>	        <cac:Item>	            <cbc:Name>XSLT Online Editor 😎</cbc:Name>	        </cac:Item>	        <cac:Price>	            <cbc:PriceAmount currencyID="TRY">10.00</cbc:PriceAmount>	        </cac:Price>	    </cac:InvoiceLine>		    <!-- Toplam Tutar -->	    <cac:LegalMonetaryTotal>	        <cbc:LineExtensionAmount currencyID="TRY">100.00</cbc:LineExtensionAmount>	        <cbc:TaxExclusiveAmount currencyID="TRY">100.00</cbc:TaxExclusiveAmount>	        <cbc:TaxInclusiveAmount currencyID="TRY">118.00</cbc:TaxInclusiveAmount>	        <cbc:PayableAmount currencyID="TRY">118.00</cbc:PayableAmount>	    </cac:LegalMonetaryTotal>	</Invoice>`;

    // Gelişmiş seçenekler paneli
    const toggleAdvanced = document.getElementById('toggleAdvanced');
    const advancedPanel = document.getElementById('advancedPanel');
    const selectedFileName = document.getElementById('selectedFileName');

    // Toggle butonunu hazırla
    const buttonText = document.createElement('span');
    buttonText.className = 'button-text';
    buttonText.textContent = 'Gelişmiş Seçenekler';
    
    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'toggle-icon';
    toggleIcon.textContent = '▼';
    
    toggleAdvanced.innerHTML = '';
    toggleAdvanced.appendChild(buttonText);
    toggleAdvanced.appendChild(toggleIcon);

    toggleAdvanced.addEventListener('click', () => {
        const isHidden = advancedPanel.style.display === 'none';
        advancedPanel.style.display = isHidden ? 'block' : 'none';
        
        // İkon animasyonu
        toggleIcon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        buttonText.textContent = isHidden ? 'Gelişmiş Seçenekleri Gizle' : 'Gelişmiş Seçenekler';
    });

    // XML veri seçimi işleyicileri
    document.getElementById('selectXmlData').addEventListener('click', () => {
        document.getElementById('xmlFileInput').click();
    });

    document.getElementById('xmlFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedXmlData = e.target.result;
                selectedFileName.textContent = `Seçilen dosya: ${file.name}`;
            };
            reader.readAsText(file);
        }
    });

    // Gerçek zamanlı önizleme checkbox'ı
    const realtimePreviewCheckbox = document.getElementById('realtimePreview');
    let isRealtimePreviewEnabled = localStorage.getItem('realtimePreview') === 'true';

    // Başlangıç durumunu ayarla
    realtimePreviewCheckbox.checked = isRealtimePreviewEnabled;
    if (!isRealtimePreviewEnabled) {
        document.querySelector('.preview-overlay').classList.add('show');
    }

    // Checkbox değişikliklerini dinle
    realtimePreviewCheckbox.addEventListener('change', function() {
        isRealtimePreviewEnabled = this.checked;
        localStorage.setItem('realtimePreview', isRealtimePreviewEnabled);
        
        if (isRealtimePreviewEnabled) {
            updatePreview(editor.getValue());
            document.querySelector('.preview-overlay').classList.remove('show');
        } else {
            document.querySelector('.preview-overlay').classList.add('show');
        }
    });

    // Editör değişikliklerini dinle
    function setupEditorChangeListener() {
        let timeout = null;
        editor.session.on('change', function() {
            if (document.getElementById('realtimePreview').checked) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    updatePreview(editor.getValue());
                }, 1000);
            }
        });
    }

    // Güncelleme butonunu dinle
    document.getElementById('updatePreview').addEventListener('click', () => {
        const content = editor.getValue();
        updatePreview(content);
        document.querySelector('.preview-overlay').classList.remove('show');
    });

    // Ace Editor'un dil araçlarını etkinleştir
    ace.require('ace/ext/language_tools');

    // Debounce fonksiyonu
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Editor başlatıldıktan sonra ayarları yap
    function setupEditor() {
        editor.setOptions({
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false
        });

        // Özel tamamlayıcıyı kaldır
        editor.completers = [];
    }

    // Tema değiştirme işlevselliği
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Tema değişikliğini uygula
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Editör temasını güncelle
        const editorTheme = newTheme === 'light' ? 'ace/theme/chrome' : 'ace/theme/dracula';
        if (editor) {
            editor.setTheme(editorTheme);
        }
    });

    // Menü işlevselliğini başlat
    function initMenuFunctionality() {
        // Yeni dosya menüsü
        const newMenuItem = document.getElementById('newMenuItem');
        if (newMenuItem) {
            newMenuItem.addEventListener('click', () => {
                const newFileModal = document.getElementById('newFileModal');
                if (newFileModal) {
                    newFileModal.style.display = 'flex';
                }
            });
        }

        // Kaydet menüsü
        const saveMenuItem = document.getElementById('saveMenuItem');
        if (saveMenuItem) {
            saveMenuItem.addEventListener('click', () => {
        const saveFileModal = document.getElementById('saveFileModal');
                if (saveFileModal) {
                    saveFileModal.style.display = 'flex';
                }
            });
        }

        // Hakkında menüsü
        const aboutMenuItem = document.getElementById('aboutMenuItem');
        const aboutModal = document.getElementById('aboutModal');
        const closeAboutModal = document.getElementById('closeAboutModal');

        if (aboutMenuItem) {
            aboutMenuItem.addEventListener('click', () => {
                if (aboutModal) {
                    aboutModal.style.display = 'flex';
                }
            });
        }

        if (closeAboutModal) {
            closeAboutModal.addEventListener('click', () => {
                if (aboutModal) {
                    aboutModal.style.display = 'none';
                }
            });
        }

        // Modal dışına tıklama ile kapatma
        if (aboutModal) {
            aboutModal.addEventListener('click', (e) => {
                if (e.target === aboutModal) {
                    aboutModal.style.display = 'none';
                }
            });
        }

        // ESC tuşu ile modalı kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && aboutModal && aboutModal.style.display === 'flex') {
                aboutModal.style.display = 'none';
            }
        });

        // Modal kapatma butonları
        const closeButtons = document.querySelectorAll('.modal .close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Yeni dosya modalı butonları
        const confirmNewFile = document.getElementById('confirmNewFile');
        const cancelNewFile = document.getElementById('cancelNewFile');
        const closeNewFileModal = document.getElementById('closeNewFileModal');
        const newFileModal = document.getElementById('newFileModal');

        if (confirmNewFile) {
            confirmNewFile.addEventListener('click', () => {
                if (editor) {
                    editor.setValue(defaultXSLT);
                    editor.clearSelection();
                    editor.moveCursorTo(0, 0);
                    updatePreview(defaultXSLT);
                }
                if (newFileModal) {
                    newFileModal.style.display = 'none';
                }                
            });
        }

        if (cancelNewFile || closeNewFileModal) {
            const closeModal = () => {
                if (newFileModal) {
                    newFileModal.style.display = 'none';
                }
            };
            cancelNewFile?.addEventListener('click', closeModal);
            closeNewFileModal?.addEventListener('click', closeModal);
        }

        // Kaydet modalı butonları
        const confirmSaveFile = document.getElementById('confirmSaveFile');
        const closeSaveFileModal = document.getElementById('closeSaveFileModal');
        const saveFileModal = document.getElementById('saveFileModal');

        if (confirmSaveFile) {
        confirmSaveFile.addEventListener('click', () => {
                const fileName = document.getElementById('saveFileName').value || 'untitled.xslt';
            const content = editor.getValue();
                
                // Dosyayı kaydet
                const blob = new Blob([content], { type: 'text/xml' });
                const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
                document.body.appendChild(a);
            a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                if (saveFileModal) {
            saveFileModal.style.display = 'none';
                }
                showToast('Dosya başarıyla kaydedildi', 'success');
            });
        }

        if (closeSaveFileModal) {
            closeSaveFileModal.addEventListener('click', () => {
                if (saveFileModal) {
                    saveFileModal.style.display = 'none';
                }
            });
        }

        // ESC tuşu ile modalları kapatma
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.style.display === 'flex') {
                        modal.style.display = 'none';
                    }
                });
            }
        });

        // Modal dışına tıklama ile kapatma
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        });

        // Editör büyütme checkbox'ı
        const expandEditorCheckbox = document.getElementById('expandEditorCheckbox');
        if (expandEditorCheckbox) {
        expandEditorCheckbox.addEventListener('change', function() {
            const previewPane = document.querySelector('.preview-pane');
            const editorPane = document.querySelector('.editor-pane');
            const resizer = document.querySelector('.resizer');
            
            if (this.checked) {
                    // Editörü büyüt
                previewPane.style.display = 'none';
                editorPane.style.width = '100%';
                resizer.style.display = 'none';
            } else {
                    // Normal görünüme dön
                previewPane.style.display = 'block';
                editorPane.style.width = '50%';
                    previewPane.style.width = '50%';
                resizer.style.display = 'block';
                resizer.style.left = '50%';
            }
            
                // Editör boyutunu güncelle
                if (editor) {
            editor.resize();
                }
            });
        }

        // XSLT İyileştirme menüsü
        const beautifyMenuItem = document.getElementById('beautifyMenuItem');
        if (beautifyMenuItem) {
            beautifyMenuItem.addEventListener('click', async () => {
                if (!editor) {
                    showToast('Editör başlatılmamış!', 'error');
                    return;
                }
                
                const currentContent = editor.getValue();
                if (!currentContent.trim()) {
                    showToast('Lütfen önce XSLT kodunu girin!', 'error');
                    return;
                }

                try {
                    const beautifiedContent = beautifyXSLT(currentContent);
                    editor.setValue(beautifiedContent);
                    editor.clearSelection();
                    editor.moveCursorTo(0, 0);
                    editor.focus();
                    showToast('XSLT kodu başarıyla iyileştirildi!', 'success');
                } catch (error) {
                    showToast(`İyileştirme hatası: ${error.message}`, 'error');
                }
            });
        }
    }

    // Yeniden boyutlandırma
    const resizer = document.querySelector('.resizer');
    const previewPane = document.querySelector('.preview-pane');
    const editorPane = document.querySelector('.editor-pane');
    const splitViewContainer = document.querySelector('.split-view');
    let isResizing = false;
    let startX;
    let startPreviewWidth;

    function initResize(e) {
        if (e.button !== 0) return; // Sadece sol tıklama
        isResizing = true;
        startX = e.pageX;
        startPreviewWidth = previewPane.offsetWidth;

        // Performans için geçici sınıf ekle
        document.body.classList.add('resizing');
        
        // Seçimi devre dışı bırak
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';

        // Event listener'ları ekle
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
        
        // Performans için iframe'i geçici olarak gizle
        document.getElementById('preview').style.pointerEvents = 'none';
        
        e.preventDefault();
    }

    const handleResize = (e) => {
        if (!isResizing) return;

        // Fare hareketini hesapla
        const dx = e.pageX - startX;
        
        // Container genişliğini al
        const containerWidth = splitViewContainer.offsetWidth;
        
        // Yeni genişliği hesapla
        let newWidth = startPreviewWidth + dx;
        
        // Minimum ve maksimum sınırları kontrol et
        const minWidth = containerWidth * 0.2; // Minimum %20
        const maxWidth = containerWidth * 0.8; // Maksimum %80
        
        newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
        
        // Yüzdeleri hesapla
        const previewPercentage = (newWidth / containerWidth) * 100;
        const editorPercentage = 100 - previewPercentage;
        
        // Genişlikleri güncelle
        previewPane.style.width = `${previewPercentage}%`;
        editorPane.style.width = `${editorPercentage}%`;
        resizer.style.left = `${previewPercentage}%`;

        // Editör boyutunu güncelle
        if (editor) {
            requestAnimationFrame(() => editor.resize());
        }
    };

    function stopResize() {
        if (!isResizing) return;
        
        isResizing = false;
        
        // Geçici sınıfı ve stilleri kaldır
        document.body.classList.remove('resizing');
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        
        // Event listener'ları kaldır
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        
        // iframe'i tekrar aktif et
        document.getElementById('preview').style.pointerEvents = '';
        
        // Son bir kez editör boyutunu güncelle
        if (editor) {
            editor.resize();
        }
    }

    // Touch olayları için destek ekle
    resizer.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        initResize({ button: 0, pageX: touch.pageX, preventDefault: () => e.preventDefault() });
    });

    document.addEventListener('touchend', stopResize);
    document.addEventListener('touchcancel', stopResize);

    document.addEventListener('touchmove', (e) => {
        if (!isResizing) return;
        const touch = e.touches[0];
        handleResize({ pageX: touch.pageX });
    }, { passive: true });

    // Mouse olayları için event listener'ları ekle
    resizer.addEventListener('mousedown', initResize);

    // Pencere yeniden boyutlandırma
    window.addEventListener('resize', debounce(() => {
        editor.resize();
    }, 150), { passive: true });

    // Editör başlatıldıktan sonra menü işlevselliğini başlat
    if (newFileBtn) {
        newFileBtn.addEventListener('click', () => {
            welcomePopup.style.display = 'none';
            container.style.display = 'flex';
            editor = initEditor('editor');
            editor.setValue(defaultXSLT, -1);
            editor.clearSelection();
            initSearch();
            setupEditorChangeListener();
            setupEditor();
            
            // Editör temasını ayarla
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const editorTheme = currentTheme === 'light' ? 'ace/theme/chrome' : 'ace/theme/dracula';
            editor.setTheme(editorTheme);
            
            initMenuFunctionality();
            updatePreview(defaultXSLT);

            showToast('Yeni dosya oluşturuldu', 'success');
        });
    }

    if (openFileBtn) {
        openFileBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // XSLT dosyası yükleme
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    welcomePopup.style.display = 'none';
                    container.style.display = 'flex';
                    editor = initEditor('editor');
                    editor.setValue(e.target.result, -1);
                    editor.clearSelection();
                    initSearch();
                    setupEditorChangeListener();
                    setupEditor();
                    
                    // Editör temasını ayarla
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    const editorTheme = currentTheme === 'light' ? 'ace/theme/chrome' : 'ace/theme/dracula';
                    editor.setTheme(editorTheme);
                    
                    initMenuFunctionality();
                    updatePreview(e.target.result);
                };
                reader.readAsText(file);
            }
        });
    }

    // XSLT özel tamamlama önerileri
    const xsltCompletions = {
        'xsl:stylesheet': {
            prefix: 'stylesheet',
            body: '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n\t${0}\n</xsl:stylesheet>',
            description: 'XSLT stylesheet ana elementi'
        },
        'xsl:template': {
            prefix: 'template',
            body: '<xsl:template match="${1:pattern}">\n\t${0}\n</xsl:template>',
            description: 'XSLT template elementi'
        },
        'xsl:value-of': {
            prefix: 'value-of',
            body: '<xsl:value-of select="${1:xpath}"/>',
            description: 'Değer seçimi'
        },
        'xsl:for-each': {
            prefix: 'for-each',
            body: '<xsl:for-each select="${1:xpath}">\n\t${0}\n</xsl:for-each>',
            description: 'Döngü elementi'
        },
        'xsl:if': {
            prefix: 'if',
            body: '<xsl:if test="${1:condition}">\n\t${0}\n</xsl:if>',
            description: 'Koşul elementi'
        },
        'xsl:choose': {
            prefix: 'choose',
            body: '<xsl:choose>\n\t<xsl:when test="${1:condition}">\n\t\t${2}\n\t</xsl:when>\n\t<xsl:otherwise>\n\t\t${0}\n\t</xsl:otherwise>\n</xsl:choose>',
            description: 'Switch-case benzeri yapı'
        },
        'xsl:variable': {
            prefix: 'variable',
            body: '<xsl:variable name="${1:name}" select="${2:xpath}"/>',
            description: 'Değişken tanımlama'
        },
        'xsl:param': {
            prefix: 'param',
            body: '<xsl:param name="${1:name}" select="${2:xpath}"/>',
            description: 'Parametre tanımlama'
        },
        'xsl:apply-templates': {
            prefix: 'apply-templates',
            body: '<xsl:apply-templates select="${1:xpath}"/>',
            description: 'Template uygulama'
        },
        'xsl:sort': {
            prefix: 'sort',
            body: '<xsl:sort select="${1:xpath}" order="${2:ascending}"/>',
            description: 'Sıralama elementi'
        }
    };

    // Özel completer oluştur
    const xsltCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            const completions = [];
            Object.keys(xsltCompletions).forEach(key => {
                const item = xsltCompletions[key];
                completions.push({
                    caption: item.prefix,
                    snippet: item.body,
                    meta: 'XSLT',
                    type: 'snippet',
                    score: 1000,
                    docHTML: `<b>${key}</b><hr>${item.description}`
                });
            });
            callback(null, completions);
        }
    };

    function initEditor(containerId) {
        const editor = ace.edit(containerId);
        editor.setTheme("ace/theme/dracula");
        editor.session.setMode("ace/mode/xml");
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            fontSize: "14px",
            showPrintMargin: false,
            highlightActiveLine: true,
            wrap: true
        });
        return editor;
    }

    // Arama işlevleri
    let currentSearch = null;
    let searchResults = [];

    function initSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchResultsContainer = document.querySelector('.search-results');
        const prevButton = document.getElementById('prevSearch');
        const nextButton = document.getElementById('nextSearch');

        function findAllOccurrences(needle) {
            const session = editor.getSession();
            const lines = session.getLines(0, session.getLength());
            const results = [];
            
            lines.forEach((line, lineIndex) => {
                let index = -1;
                while ((index = line.toLowerCase().indexOf(needle.toLowerCase(), index + 1)) !== -1) {
                    results.push({
                        line: lineIndex,
                        column: index,
                        content: line.trim(),
                        length: needle.length
                    });
                }
            });
            
            return results;
        }

        function showSearchResults(results) {
            searchResultsContainer.innerHTML = '';
            
            if (results.length === 0) {
                searchResultsContainer.classList.remove('show');
                return;
            }

            results.forEach((result, index) => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = `
                    <div class="search-result-line">Satır ${result.line + 1}</div>
                    <div class="search-result-content">${result.content}</div>
                `;
                
                div.addEventListener('click', () => {
                    // Editörü odakla ve ilgili satıra git
                    editor.focus();
                    
                    // Satır ve sütun pozisyonlarını ayarla
                    const targetRow = result.line;
                    const targetColumn = result.column;
                    
                    // Önce satıra git ve görünür olmasını sağla
                    editor.gotoLine(targetRow + 1, targetColumn, true);
                    
                    // Seçimi yap
                    const Range = ace.require('ace/range').Range;
                    const range = new Range(targetRow, targetColumn, targetRow, targetColumn + result.length);
                    editor.getSession().getSelection().setSelectionRange(range);
                    
                    // Satırı vurgula
                    const marker = editor.getSession().addMarker(
                        new Range(targetRow, 0, targetRow, Infinity),
                        "highlighted-line",
                        "fullLine",
                        false
                    );

                    // Vurgulamayı kaldır
                    setTimeout(() => {
                        editor.getSession().removeMarker(marker);
                    }, 2000);

                    // Tarayıcının arama fonksiyonunu tetikle
                    window.find(result.content.trim());
                    
                    searchResultsContainer.classList.remove('show');
                });
                
                searchResultsContainer.appendChild(div);
            });
            
            searchResultsContainer.classList.add('show');
        }

        searchInput.addEventListener('input', () => {
            const needle = searchInput.value;
            if (needle && needle.length >= 2) {
                searchResults = findAllOccurrences(needle);
                showSearchResults(searchResults);
                currentSearch = needle;
            } else {
                searchResults = [];
                searchResultsContainer.classList.remove('show');
                currentSearch = null;
            }
        });

        // Focus olduğunda otomatik önerileri göster
        searchInput.addEventListener('focus', function() {
            if (this.value.trim()) {
                searchResults = findAllOccurrences(this.value);
                showSearchResults(searchResults);
            }
        });

        // F3 tuşu ile sonraki eşleşmeye git
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {
                e.preventDefault();
                if (currentSearch) {
                    if (e.shiftKey) {
                        window.find(currentSearch, false, true); // Geriye doğru ara
                    } else {
                        window.find(currentSearch); // İleriye doğru ara
                    }
                }
            }
        });

        // Tıklama dışında suggestion box'ı kapat
        document.addEventListener('click', (e) => {
            if (!searchResultsContainer.contains(e.target) && e.target !== searchInput) {
                searchResultsContainer.classList.remove('show');
            }
        });

        // ESC tuşu ile suggestion box'ı kapat
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchResultsContainer.classList.remove('show');
                searchInput.blur();
            }
        });

        // Ctrl+F kısayolu
        editor.commands.addCommand({
            name: 'find',
            bindKey: {win: 'Ctrl-F', mac: 'Command-F'},
            exec: function() {
                searchInput.focus();
            }
        });
    }

    // XML dönüşüm fonksiyonu
    function convertToUBLFormat(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

            // XML parse hatası kontrolü
            if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
                throw new Error('XML ayrıştırma hatası');
            }

            // Belge formatı kontrolü
            const rootElement = xmlDoc.documentElement;
            
            // Eğer belge zaten UBL-TR formatındaysa, doğrudan döndür
            if (rootElement.nodeName === 'Invoice' || 
                rootElement.nodeName === 'DespatchAdvice' || 
                rootElement.nodeName === 'ReceiptAdvice') {
                return xmlString;
            }
            
            // MikroDocument formatı kontrolü
            const mikroDoc = xmlDoc.getElementsByTagName('MikroDocument')[0];
            if (!mikroDoc) {
                throw new Error('Desteklenmeyen belge formatı: Belge UBL-TR veya MikroDocument formatında olmalıdır.');
            }

            // Fatura veya İrsaliye kontrolü
            const invoice = xmlDoc.querySelector("Invoice");
            const despatchAdvice = xmlDoc.querySelector("DespatchAdvice");
            
            if (!invoice && !despatchAdvice) {
                throw new Error('Fatura veya İrsaliye bilgisi bulunamadı');
            }

            // Belge tipini belirle
            const documentType = invoice ? "Invoice" : "DespatchAdvice";
            const sourceDoc = invoice || despatchAdvice;

            // Yeni UBL dokümanı oluştur
            const ublDoc = document.implementation.createDocument(
                `urn:oasis:names:specification:ubl:schema:xsd:${documentType}-2`,
                documentType,
                null
            );
            const root = ublDoc.documentElement;

            // Namespace tanımlamaları
            root.setAttribute("xmlns", `urn:oasis:names:specification:ubl:schema:xsd:${documentType}-2`);
            root.setAttribute("xmlns:cac", "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2");
            root.setAttribute("xmlns:cbc", "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2");
            root.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
            root.setAttribute("xmlns:ext", "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2");

            // Yardımcı fonksiyonlar
            const createElement = (name, value = null, attributes = {}) => {
                const [prefix, localName] = name.split(':');
                const ns = prefix === 'cac' ? 
                    "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" :
                    prefix === 'cbc' ? 
                        "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" :
                        `urn:oasis:names:specification:ubl:schema:xsd:${documentType}-2`;
                
                const element = ublDoc.createElementNS(ns, name);
                if (value !== null) element.textContent = value;
                Object.entries(attributes).forEach(([key, val]) => {
                    if (val !== null && val !== undefined) {
                        element.setAttribute(key, val);
                    }
                });
                return element;
            };

            const appendElement = (parent, name, value = null, attributes = {}) => {
                const element = createElement(name, value, attributes);
                parent.appendChild(element);
                return element;
            };

            const getElementValue = (element, selector) => {
                const node = element.querySelector(selector);
                return node ? node.textContent : null;
            };

            const getElementAttribute = (element, selector, attribute) => {
                const node = element.querySelector(selector);
                return node ? node.getAttribute(attribute) : null;
            };

            // Temel UBL elemanları
            const coreElements = [
                ["cbc:UBLVersionID", "2.1"],
                ["cbc:CustomizationID", documentType === "Invoice" ? "TR1.2" : "TR1.0"],
                ["cbc:ProfileID", getElementValue(sourceDoc, "ProfileID") || "TICARIFATURA"],
                ["cbc:ID", getElementValue(sourceDoc, "TransactionSerial") + getElementValue(sourceDoc, "TransactionNumber")],
                ["cbc:UUID", getElementValue(sourceDoc, "UUID")],
                ["cbc:IssueDate", getElementValue(sourceDoc, "DocumentDate")],
                ["cbc:IssueTime", getElementValue(sourceDoc, "DocumentTime")]
            ];

            if (documentType === "Invoice") {
                coreElements.push(
                    ["cbc:InvoiceTypeCode", getElementValue(sourceDoc, "InvoiceTypeCode")],
                    ["cbc:DocumentCurrencyCode", getElementValue(sourceDoc, "DocumentCurrencyCode")]
                );

                // Not alanlarını ekle
                const notes = sourceDoc.querySelectorAll("Note");
                notes.forEach(note => {
                    coreElements.push(["cbc:Note", note.textContent]);
                });
            } else {
                coreElements.push(
                    ["cbc:DespatchAdviceTypeCode", getElementValue(sourceDoc, "DespatchAdviceTypeCode")],
                    ["cbc:CopyIndicator", getElementValue(sourceDoc, "CopyIndicator")]
                );
            }

            coreElements.push(["cbc:LineCountNumeric", getElementValue(sourceDoc, "LineCountNumeric")]);

            coreElements.forEach(([name, value]) => {
                if (value) appendElement(root, name, value);
            });

            // Taraf bilgileri
            const processParty = (partyElement, targetElementName) => {
                if (!partyElement) return;

                const party = partyElement.querySelector("Party");
                if (!party) return;

                const targetParty = appendElement(root, targetElementName);
                const partyElement2 = appendElement(targetParty, "cac:Party");

                // WebsiteURI
                const websiteUri = getElementValue(party, "WebsiteURI");
                if (websiteUri) {
                    appendElement(partyElement2, "cbc:WebsiteURI", websiteUri);
                }

                // PartyIdentification
                const partyIdentifications = party.querySelectorAll("PartyIdentification");
                partyIdentifications.forEach(identification => {
                    const id = identification.querySelector("ID");
                    if (id) {
                        const partyIdentification = appendElement(partyElement2, "cac:PartyIdentification");
                        appendElement(partyIdentification, "cbc:ID", id.textContent, {
                            schemeID: id.getAttribute("schemeID")
                        });
                    }
                });

                // PartyName
                const partyName = getElementValue(party, "PartyName Name");
                if (partyName) {
                    const partyNameElement = appendElement(partyElement2, "cac:PartyName");
                    appendElement(partyNameElement, "cbc:Name", partyName);
                }

                // PostalAddress
                const postalAddress = party.querySelector("PostalAddress");
                if (postalAddress) {
                    const postalAddressElement = appendElement(partyElement2, "cac:PostalAddress");
                    
                    ["StreetName", "BuildingNumber", "CitySubdivisionName", "CityName", "PostalZone", "Region"].forEach(field => {
                        const value = getElementValue(postalAddress, field);
                        if (value) appendElement(postalAddressElement, `cbc:${field}`, value);
                    });

                    const country = postalAddress.querySelector("Country");
                    if (country) {
                        const countryElement = appendElement(postalAddressElement, "cac:Country");
                        appendElement(countryElement, "cbc:IdentificationCode", getElementValue(country, "IdentificationCode"));
                        appendElement(countryElement, "cbc:Name", getElementValue(country, "Name"));
                    }
                }

                // PartyTaxScheme
                const taxScheme = getElementValue(party, "PartyTaxScheme TaxScheme Name");
                if (taxScheme) {
                    const partyTaxScheme = appendElement(partyElement2, "cac:PartyTaxScheme");
                    const taxSchemeElement = appendElement(partyTaxScheme, "cac:TaxScheme");
                    appendElement(taxSchemeElement, "cbc:Name", taxScheme);
                }

                // Contact
                const contact = party.querySelector("Contact");
                if (contact) {
                    const contactElement = appendElement(partyElement2, "cac:Contact");
                    ["Telephone", "Telefax", "ElectronicMail"].forEach(field => {
                        const value = getElementValue(contact, field);
                        if (value) appendElement(contactElement, `cbc:${field}`, value);
                    });
                }
            };

            // Tarafları işle
            if (documentType === "Invoice") {
                processParty(sourceDoc.querySelector("AccountingSupplierParty"), "cac:AccountingSupplierParty");
                processParty(sourceDoc.querySelector("AccountingCustomerParty"), "cac:AccountingCustomerParty");
                processParty(sourceDoc.querySelector("BuyerCustomerParty"), "cac:BuyerCustomerParty");
            } else {
                processParty(sourceDoc.querySelector("DespatchSupplierParty"), "cac:DespatchSupplierParty");
                processParty(sourceDoc.querySelector("DeliveryCustomerParty"), "cac:DeliveryCustomerParty");
            }

            // Teslimat bilgileri
            const delivery = sourceDoc.querySelector("Delivery");
            if (delivery) {
                const deliveryElement = appendElement(root, "cac:Delivery");
                
                // Teslimat adresi
                const deliveryAddress = delivery.querySelector("DeliveryAddress");
                if (deliveryAddress) {
                    const addressElement = appendElement(deliveryElement, "cac:DeliveryAddress");
                    ["StreetName", "BuildingNumber", "CitySubdivisionName", "CityName", "PostalZone"].forEach(field => {
                        const value = getElementValue(deliveryAddress, field);
                        if (value) appendElement(addressElement, `cbc:${field}`, value);
                    });

                    const country = deliveryAddress.querySelector("Country");
                    if (country) {
                        const countryElement = appendElement(addressElement, "cac:Country");
                        appendElement(countryElement, "cbc:IdentificationCode", getElementValue(country, "IdentificationCode"));
                        appendElement(countryElement, "cbc:Name", getElementValue(country, "Name"));
                    }
                }
            }

            // Döviz kuru bilgileri
            const exchangeRate = sourceDoc.querySelector("PricingExchangeRate");
            if (exchangeRate) {
                const rateElement = appendElement(root, "cac:PricingExchangeRate");
                appendElement(rateElement, "cbc:SourceCurrencyCode", getElementValue(exchangeRate, "SourceCurrencyCode"));
                appendElement(rateElement, "cbc:TargetCurrencyCode", getElementValue(exchangeRate, "TargetCurrencyCode"));
                appendElement(rateElement, "cbc:CalculationRate", getElementValue(exchangeRate, "CalculationRate"));
            }

            if (documentType === "Invoice") {
                // Vergi toplamları
                const taxTotal = sourceDoc.querySelector("TaxTotal");
                if (taxTotal) {
                    const taxTotalElement = appendElement(root, "cac:TaxTotal");
                    appendElement(taxTotalElement, "cbc:TaxAmount", 
                        getElementValue(taxTotal, "TaxAmount"),
                        { currencyID: getElementAttribute(taxTotal, "TaxAmount", "currencyID") }
                    );

                    // Vergi alt detayları
                    const taxSubtotals = taxTotal.querySelectorAll("TaxSubtotal");
                    taxSubtotals.forEach(subtotal => {
                        const taxSubtotalElement = appendElement(taxTotalElement, "cac:TaxSubtotal");
                        
                        ["TaxableAmount", "TaxAmount"].forEach(field => {
                            appendElement(taxSubtotalElement, `cbc:${field}`,
                                getElementValue(subtotal, field),
                                { currencyID: getElementAttribute(subtotal, field, "currencyID") }
                            );
                        });

                        appendElement(taxSubtotalElement, "cbc:Percent", getElementValue(subtotal, "Percent"));

                        const taxCategory = appendElement(taxSubtotalElement, "cac:TaxCategory");
                        
                        // Vergi muafiyet kodları
                        const exemptionReasonCode = getElementValue(subtotal, "TaxCategory TaxExemptionReasonCode");
                        const exemptionReason = getElementValue(subtotal, "TaxCategory TaxExemptionReason");
                        
                        if (exemptionReasonCode) {
                            appendElement(taxCategory, "cbc:TaxExemptionReasonCode", exemptionReasonCode);
                        }
                        if (exemptionReason) {
                            appendElement(taxCategory, "cbc:TaxExemptionReason", exemptionReason);
                        }

                        const taxScheme = appendElement(taxCategory, "cac:TaxScheme");
                        appendElement(taxScheme, "cbc:Name", getElementValue(subtotal, "TaxCategory TaxScheme Name"));
                        appendElement(taxScheme, "cbc:TaxTypeCode", getElementValue(subtotal, "TaxCategory TaxScheme TaxTypeCode"));
                    });
                }

                // Parasal toplamlar
                const monetaryTotal = sourceDoc.querySelector("LegalMonetaryTotal");
                if (monetaryTotal) {
                    const monetaryTotalElement = appendElement(root, "cac:LegalMonetaryTotal");
                    
                    [
                        "LineExtensionAmount",
                        "TaxExclusiveAmount",
                        "TaxInclusiveAmount",
                        "AllowanceTotalAmount",
                        "ChargeTotalAmount",
                        "PayableRoundingAmount",
                        "PayableAmount"
                    ].forEach(field => {
                        const value = getElementValue(monetaryTotal, field);
                        const currencyID = getElementAttribute(monetaryTotal, field, "currencyID");
                        if (value) {
                            appendElement(monetaryTotalElement, `cbc:${field}`, value, { currencyID });
                        }
                    });
                }

                // Fatura satırları
                sourceDoc.querySelectorAll("InvoiceLine").forEach(line => {
                    const invoiceLine = appendElement(root, "cac:InvoiceLine");
                    
                    // Temel satır bilgileri
                    appendElement(invoiceLine, "cbc:ID", getElementValue(line, "ID"));
                    
                    const quantity = line.querySelector("InvoicedQuantity");
                    if (quantity) {
                        appendElement(invoiceLine, "cbc:InvoicedQuantity",
                            quantity.textContent,
                            { unitCode: quantity.getAttribute("unitCode") }
                        );
                    }

                    const lineExtensionAmount = line.querySelector("LineExtensionAmount");
                    if (lineExtensionAmount) {
                        appendElement(invoiceLine, "cbc:LineExtensionAmount",
                            lineExtensionAmount.textContent,
                            { currencyID: lineExtensionAmount.getAttribute("currencyID") }
                        );
                    }

                    // Teslimat bilgileri
                    const delivery = line.querySelector("Delivery");
                    if (delivery) {
                        const deliveryElement = appendElement(invoiceLine, "cac:Delivery");
                        
                        // Teslimat şartları
                        const deliveryTerms = delivery.querySelector("DeliveryTerms");
                        if (deliveryTerms) {
                            const termsElement = appendElement(deliveryElement, "cac:DeliveryTerms");
                            const id = deliveryTerms.querySelector("ID");
                            if (id) {
                                appendElement(termsElement, "cbc:ID", id.textContent, {
                                    schemeID: id.getAttribute("schemeID")
                                });
                            }
                        }

                        // Sevkiyat bilgileri
                        const shipment = delivery.querySelector("Shipment");
                        if (shipment) {
                            const shipmentElement = appendElement(deliveryElement, "cac:Shipment");
                            
                            // GTIP kodu
                            const goodsItem = shipment.querySelector("GoodsItem");
                            if (goodsItem) {
                                const goodsItemElement = appendElement(shipmentElement, "cac:GoodsItem");
                                appendElement(goodsItemElement, "cbc:RequiredCustomsID", 
                                    getElementValue(goodsItem, "RequiredCustomsID")
                                );
                            }

                            // Taşıma modu
                            const shipmentStage = shipment.querySelector("ShipmentStage");
                            if (shipmentStage) {
                                const stageElement = appendElement(shipmentElement, "cac:ShipmentStage");
                                appendElement(stageElement, "cbc:TransportModeCode", 
                                    getElementValue(shipmentStage, "TransportModeCode")
                                );
                            }
                        }
                    }

                    // Vergi bilgileri
                    const taxTotal = line.querySelector("TaxTotal");
                    if (taxTotal) {
                        const taxTotalElement = appendElement(invoiceLine, "cac:TaxTotal");
                        appendElement(taxTotalElement, "cbc:TaxAmount",
                            getElementValue(taxTotal, "TaxAmount"),
                            { currencyID: getElementAttribute(taxTotal, "TaxAmount", "currencyID") }
                        );

                        const taxSubtotal = taxTotal.querySelector("TaxSubtotal");
                        if (taxSubtotal) {
                            const taxSubtotalElement = appendElement(taxTotalElement, "cac:TaxSubtotal");
                            
                            ["TaxableAmount", "TaxAmount"].forEach(field => {
                                appendElement(taxSubtotalElement, `cbc:${field}`,
                                    getElementValue(taxSubtotal, field),
                                    { currencyID: getElementAttribute(taxSubtotal, field, "currencyID") }
                                );
                            });

                            appendElement(taxSubtotalElement, "cbc:Percent", getElementValue(taxSubtotal, "Percent"));

                            const taxCategory = appendElement(taxSubtotalElement, "cac:TaxCategory");
                            const taxScheme = appendElement(taxCategory, "cac:TaxScheme");
                            appendElement(taxScheme, "cbc:Name", getElementValue(taxSubtotal, "TaxCategory TaxScheme Name"));
                            appendElement(taxScheme, "cbc:TaxTypeCode", getElementValue(taxSubtotal, "TaxCategory TaxScheme TaxTypeCode"));
                        }
                    }

                    // Ürün bilgileri
                    const item = line.querySelector("Item");
                    if (item) {
                        const itemElement = appendElement(invoiceLine, "cac:Item");
                        appendElement(itemElement, "cbc:Description", getElementValue(item, "Description"));
                        appendElement(itemElement, "cbc:Name", getElementValue(item, "Name"));

                        // Alıcı ve satıcı ürün kodları
                        ["Buyers", "Sellers"].forEach(type => {
                            const identification = item.querySelector(`${type}ItemIdentification`);
                            if (identification) {
                                const identificationElement = appendElement(itemElement, `cac:${type}ItemIdentification`);
                                appendElement(identificationElement, "cbc:ID", getElementValue(identification, "ID"));
                            }
                        });

                        // Menşei ülke bilgisi
                        const originCountry = item.querySelector("OriginCountry");
                        if (originCountry) {
                            const originCountryElement = appendElement(itemElement, "cac:OriginCountry");
                            appendElement(originCountryElement, "cbc:IdentificationCode", getElementValue(originCountry, "IdentificationCode"));
                            appendElement(originCountryElement, "cbc:Name", getElementValue(originCountry, "Name"));
                        }
                    }

                    // Fiyat bilgileri
                    const price = line.querySelector("Price");
                    if (price) {
                        const priceElement = appendElement(invoiceLine, "cac:Price");
                        appendElement(priceElement, "cbc:PriceAmount",
                            getElementValue(price, "PriceAmount"),
                            { currencyID: getElementAttribute(price, "PriceAmount", "currencyID") }
                        );
                    }
                });
            }

            // XML'i stringe dönüştür
            const serializer = new XMLSerializer();
            return serializer.serializeToString(root);
        } catch (error) {
            console.error('XML dönüşüm hatası:', error);
            throw error;
        }
    }

    // updatePreview fonksiyonunu güncelle
    const updatePreview = (xsltCode) => {
        try {
            const parser = new DOMParser();
            const xsltProcessor = new XSLTProcessor();
            
            // XML verisini UBL formatına dönüştür
            const convertedXmlData = convertToUBLFormat(selectedXmlData);
            console.log('Orijinal XML:', selectedXmlData);
            console.log('Dönüştürülen UBL XML:', convertedXmlData);

            // XML ve XSLT dokümanlarını parse et
            const xmlDoc = parser.parseFromString(convertedXmlData, "text/xml");
            const xsltDoc = parser.parseFromString(xsltCode, "text/xml");
            
            // Parse hatalarını kontrol et
            const xmlParseError = xmlDoc.getElementsByTagName('parsererror');
            const xsltParseError = xsltDoc.getElementsByTagName('parsererror');
            
            if (xmlParseError.length > 0) {
                throw new Error('XML parse hatası: ' + xmlParseError[0].textContent);
            }
            if (xsltParseError.length > 0) {
                throw new Error('XSLT parse hatası: ' + xsltParseError[0].textContent);
            }

            // XSLT dönüşümünü gerçekleştir
            xsltProcessor.importStylesheet(xsltDoc);
            const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
            
            if (!resultDoc) {
                throw new Error('XSLT dönüşümü başarısız oldu');
            }

            // Dönüşüm sonucunu kontrol et
            console.log('XSLT dönüşüm sonucu:', new XMLSerializer().serializeToString(resultDoc));
            
            const preview = document.getElementById('preview');
            if (!preview) {
                throw new Error('Preview elementi bulunamadı');
            }

            // QR kod kütüphanesi ve özel arama scripti
            const searchScript = `
                <script>
                document.addEventListener('keydown', function(e) {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                            e.preventDefault();
                        e.stopPropagation();
                        
                        const selectedText = window.getSelection().toString().trim();
                            if (selectedText) {
                            window.parent.postMessage({
                                type: 'search',
                                text: selectedText
                            }, '*');
                            }
                        }
                    });
                </script>
            `;
            
            const qrScript = `<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js">
                              </script><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>`;
            preview.srcdoc = qrScript + searchScript + new XMLSerializer().serializeToString(resultDoc);
            
            // Hata mesajını temizle
            const errorElement = document.getElementById('error-message');
            if (errorElement) {
                errorElement.textContent = '';
            }
        } catch (error) {
            console.error('Dönüşüm hatası:', error);
            const errorElement = document.getElementById('error-message');
            if (errorElement) {
                errorElement.textContent = `Dönüşüm hatası: ${error.message}`;
            }
            
            const preview = document.getElementById('preview');
            if (preview) {
                preview.srcdoc = `
                    <div style="color: red; padding: 20px; font-family: Arial, sans-serif;">
                        <h3>Dönüşüm Hatası</h3>
                        <p>${error.message}</p>
                        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
                    </div>
                `;
            }
        }
    };

    // Ana pencerede mesajları dinle
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'search') {
            const searchText = event.data.text;
            console.log('Aranacak metin:', searchText);
            
            // Arama kutusuna metni yaz
        const searchInput = document.getElementById('searchInput');
        searchInput.value = searchText;
        searchInput.focus();
        // Arama sonuçlarını göstermek için input eventini tetikle
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
            
            // Editörde ara
            const session = editor.getSession();
            const lines = session.getLines(0, session.getLength());
            let found = false;
            
            console.log('Toplam satır sayısı:', lines.length);
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const index = line.toLowerCase().indexOf(searchText.toLowerCase());
                
                if (index !== -1) {
                    console.log('Eşleşme bulundu - Satır:', i + 1, 'Pozisyon:', index);
                    found = true;
                    
                    // Önce satıra git
                    editor.gotoLine(i + 1);
                    editor.scrollToLine(i, true, true);
                    
                    // Sonra seçimi yap
                    const Range = ace.require('ace/range').Range;
                    const range = new Range(i, index, i, index + searchText.length);
                    editor.getSession().getSelection().setSelectionRange(range);
                    
                    // Satırı vurgula
                    const marker = editor.getSession().addMarker(
                        new Range(i, 0, i, Infinity),
                        "highlighted-line",
                        "fullLine",
                        false
                    );
                    
                    // Vurgulamayı kaldır
                    setTimeout(() => {
                        editor.getSession().removeMarker(marker);
                    }, 2000);
                    
                    // Editöre odaklan
                    editor.focus();
                    
                    break;
                }
            }
            
            if (!found) {
                console.log('Eşleşme bulunamadı:', searchText);
            }
        }
    });

    // Büyütme işlevselliği
    let isExpanded = false;
    document.getElementById('expandEditor').addEventListener('click', function() {
        isExpanded = !isExpanded;
        
        const previewPane = document.querySelector('.preview-pane');
        const editorPane = document.querySelector('.editor-pane');
        const resizer = document.querySelector('.resizer');
        
        if (isExpanded) {
            // Editörü genişlet
            previewPane.style.display = 'none';
            editorPane.style.width = '100%';
            resizer.style.display = 'none';
            
            // Expand ikonunu değiştir
            this.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/>
                    <path fill="currentColor" d="M6 6h4v4H6z"/>
                </svg>
            `;
        } else {
            // Normal görünüme dön
            previewPane.style.display = 'block';
            previewPane.style.width = '50%';
            editorPane.style.width = '50%';
            resizer.style.display = 'block';
            resizer.style.left = '50%';
            
            // Expand ikonunu geri değiştir
            this.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <path fill="currentColor" d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/>
                </svg>
            `;
        }
        
        // Editör boyutunu güncelle
        editor.resize();
    });

    // Kaydetme işlemi
    saveFileBtn.addEventListener('click', () => {
        const content = editor.getValue();
        const blob = new Blob([content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fatura.xslt';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    });

    // Satıra gitme popup'ı işlevselliği
    const gotoLinePopup = document.getElementById('gotoLinePopup');
    const lineNumberInput = document.getElementById('lineNumberInput');
    const gotoLineBtn = document.getElementById('gotoLineBtn');
    const closeGotoLinePopup = document.getElementById('closeGotoLinePopup');

    editor.commands.addCommand({
        name: 'gotoLine',
        bindKey: {win: 'Ctrl-G', mac: 'Command-G'},
        exec: function() {
            gotoLinePopup.style.display = 'flex';
            lineNumberInput.focus();
        }
    });

    gotoLineBtn.addEventListener('click', () => {
        const lineNumber = parseInt(lineNumberInput.value, 10);
        if (!isNaN(lineNumber) && lineNumber > 0) {
            editor.scrollToLine(lineNumber - 1, true, true, () => {
                editor.gotoLine(lineNumber, 0, true);
            });
            gotoLinePopup.style.display = 'none';
            lineNumberInput.value = '';
        }
    });

    closeGotoLinePopup.addEventListener('click', () => {
        gotoLinePopup.style.display = 'none';
    });

    // ESC tuşu ile popup'ı kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && gotoLinePopup.style.display === 'flex') {
            gotoLinePopup.style.display = 'none';
        }
    });

    // Sekme kapatma onayı
    window.addEventListener('beforeunload', function(e) {
        const editorContent = editor?.getValue() || '';
        if (editorContent.trim() !== '') {
            e.preventDefault();
            e.returnValue = 'Sayfadan ayrılmak istediğinize emin misiniz? Kaydedilmemiş değişiklikleriniz kaybolabilir.';
            return e.returnValue;
        }
    });

    // Event listener'ları ekle
    document.getElementById('newFile')?.addEventListener('click', handleNewFile);
    //document.getElementById('newMenuItem')?.addEventListener('click', handleNewFile);

    // Preview iframe'den metin seçimi ve arama işlevi
    function setupPreviewSearch() {
        const preview = document.getElementById('preview');
        const searchInput = document.getElementById('searchInput');

        preview.addEventListener('load', () => {
            const previewDocument = preview.contentDocument || preview.contentWindow.document;
            
            // Double click olayını dinle
            previewDocument.addEventListener('dblclick', () => {
                const selectedText = previewDocument.getSelection().toString().trim();
                if (selectedText) {
                    console.log('Seçili metin:', selectedText);
                    searchInput.value = selectedText;
                    searchInput.focus();
                    
                    // Editörde aramayı başlat
                    const session = editor.getSession();
                    const lines = session.getLines(0, session.getLength());
                    const searchResults = [];
                    
                    lines.forEach((line, lineIndex) => {
                        let index = -1;
                        while ((index = line.toLowerCase().indexOf(selectedText.toLowerCase(), index + 1)) !== -1) {
                            searchResults.push({
                                line: lineIndex,
                                column: index,
                                content: line.trim(),
                                length: selectedText.length
                            });
                        }
                    });
                    
                    console.log('Arama sonuçları:', searchResults);
                    
                    if (searchResults.length > 0) {
                        const firstResult = searchResults[0];
                        editor.gotoLine(firstResult.line + 1, firstResult.column, true);
                        
                        const Range = ace.require('ace/range').Range;
                        const range = new Range(
                            firstResult.line,
                            firstResult.column,
                            firstResult.line,
                            firstResult.column + firstResult.length
                        );
                        editor.getSession().getSelection().setSelectionRange(range);
                        
                        const marker = editor.getSession().addMarker(
                            new Range(firstResult.line, 0, firstResult.line, Infinity),
                            "highlighted-line",
                            "fullLine",
                            false
                        );

                        setTimeout(() => {
                            editor.getSession().removeMarker(marker);
                        }, 2000);
                        
                        // Arama sonuçlarını göster
                        const searchResultsContainer = document.querySelector('.search-results');
                        searchResultsContainer.innerHTML = '';
                        
                        searchResults.forEach((result) => {
                            const div = document.createElement('div');
                            div.className = 'search-result-item';
                            div.innerHTML = `
                                <div class="search-result-line">Satır ${result.line + 1}</div>
                                <div class="search-result-content">${result.content}</div>
                            `;
                            
                            div.addEventListener('click', () => {
                                editor.gotoLine(result.line + 1, result.column, true);
                                const range = new Range(
                                    result.line,
                                    result.column,
                                    result.line,
                                    result.column + result.length
                                );
                                editor.getSession().getSelection().setSelectionRange(range);
                            });
                            
                            searchResultsContainer.appendChild(div);
                        });
                        
                        searchResultsContainer.classList.add('show');
                    }
                }
            });
        });
    }

    setupPreviewSearch();

    // Arama işlevselliği
    function setupSearch() {
        const preview = document.getElementById('preview');
        const searchInput = document.getElementById('searchInput');
        const searchResultsContainer = document.querySelector('.search-results');

    // Focus olduğunda otomatik önerileri göster
    searchInput.addEventListener('focus', function() {
        performSearch(this.value.trim());
        searchResultsContainer.classList.add('show');
    });

    // CTRL+F ile tarayıcı aramasını yönlendir
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const selection = window.getSelection().toString().trim();
            if (selection) {
                searchInput.value = selection;
                performSearch(selection);
            }
            searchInput.focus();
            
            // Preview iframe'den seçimi yakala
            const preview = document.getElementById('preview');
            const previewDoc = preview.contentDocument || preview.contentWindow.document;
            const iframeSelection = previewDoc.getSelection().toString().trim();
            if (iframeSelection) {
                searchInput.value = iframeSelection;
                performSearch(iframeSelection);
            }
        }
    });

        // Arama kutusuna yazıldığında ara
        searchInput.addEventListener('input', () => {
            const searchText = searchInput.value.trim();
            if (searchText.length >= 2) {
                performSearch(searchText);
            } else {
                searchResultsContainer.classList.remove('show');
                currentSearchResults = [];
                currentSearchIndex = -1;
            }
        });

        // F3 ve F2 tuşları ile sonuçlar arasında gezinme
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3' || (e.key === 'F2')) {
                e.preventDefault();
                
                if (currentSearchResults.length > 0) {
                    if (e.key === 'F3') {
                        // Sonraki sonuç
                        currentSearchIndex = (currentSearchIndex + 1) % currentSearchResults.length;
                    } else {
                        // Önceki sonuç
                        currentSearchIndex = currentSearchIndex <= 0 ? 
                            currentSearchResults.length - 1 : 
                            currentSearchIndex - 1;
                    }
                    
                    const result = currentSearchResults[currentSearchIndex];
                    navigateToSearchResult(result);
                    highlightSearchResultInList(currentSearchIndex);
                }
            }
        });

        // iframe yüklendiğinde event listener ekle
        preview.onload = function() {
            const previewDocument = preview.contentDocument || preview.contentWindow.document;
            
            // iframe içindeki keydown olayını dinle
            previewDocument.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    const selectedText = previewDocument.getSelection().toString().trim();
                    if (selectedText) {
                        searchInput.value = selectedText;
                        performSearch(selectedText);
                    }
                }
            });
        };
    }

    // Arama yap ve sonuçları göster
    function performSearch(searchText) {
        const session = editor.getSession();
        const lines = session.getLines(0, session.getLength());
        currentSearchResults = [];
        currentSearchIndex = -1;
        
        lines.forEach((line, lineIndex) => {
            let index = -1;
            while ((index = line.toLowerCase().indexOf(searchText.toLowerCase(), index + 1)) !== -1) {
                currentSearchResults.push({
                    line: lineIndex,
                    column: index,
                    content: line.trim(),
                    length: searchText.length
                });
            }
        });
        
        showSearchResults(currentSearchResults);
        
        if (currentSearchResults.length > 0) {
            currentSearchIndex = 0;
            navigateToSearchResult(currentSearchResults[0]);
        }
    }

    // Arama sonuçlarını göster
    function showSearchResults(results) {
        const searchResultsContainer = document.querySelector('.search-results');
        searchResultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            searchResultsContainer.classList.remove('show');
            return;
        }
        
        results.forEach((result, index) => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            if (index === currentSearchIndex) {
                div.classList.add('active');
            }
            div.innerHTML = `
                <div class="search-result-line">Satır ${result.line + 1}</div>
                <div class="search-result-content">${result.content}</div>
            `;
            
            div.addEventListener('click', () => {
                currentSearchIndex = index;
                navigateToSearchResult(result);
                highlightSearchResultInList(index);
            });
            
            searchResultsContainer.appendChild(div);
        });
        
        searchResultsContainer.classList.add('show');
    }

    // Belirli bir arama sonucuna git
    function navigateToSearchResult(result) {
        editor.gotoLine(result.line + 1);
        editor.scrollToLine(result.line, true, true);
        
        const Range = ace.require('ace/range').Range;
        const range = new Range(
            result.line,
            result.column,
            result.line,
            result.column + result.length
        );
        editor.getSession().getSelection().setSelectionRange(range);
        
        const marker = editor.getSession().addMarker(
            new Range(result.line, 0, result.line, Infinity),
            "highlighted-line",
            "fullLine",
            false
        );
        
        setTimeout(() => {
            editor.getSession().removeMarker(marker);
        }, 2000);
        
        editor.focus();
    }

    // Arama sonuçları listesinde aktif sonucu vurgula
    function highlightSearchResultInList(index) {
        const items = document.querySelectorAll('.search-result-item');
        items.forEach(item => item.classList.remove('active'));
        items[index]?.classList.add('active');
    }

    setupSearch();

    // PrettyDiff başlatma fonksiyonu
    function initPrettyDiff() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 10;
            
            function checkPrettyDiff() {
                console.log('PrettyDiff kontrolü yapılıyor...');
                if (window.prettydiff && window.prettydiff.beautify && window.prettydiff.beautify.xsl) {
                    console.log('PrettyDiff başarıyla yüklendi');
                    resolve(true);
                } else {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`PrettyDiff yüklenme denemesi: ${attempts}`);
                        setTimeout(checkPrettyDiff, 500);
                    } else {
                        console.error('PrettyDiff yüklenemedi');
                        reject(new Error('Formatlama kütüphanesi yüklenemedi!'));
                    }
                }
            }
            
            checkPrettyDiff();
        });
    }

    // Beautify özelliğini başlat
    async function initBeautifyListener() {
        try {
            await initPrettyDiff();
            console.log('Beautify özelliği başlatıldı');
        } catch (error) {
            console.error('Beautify özelliği başlatılamadı:', error);
            showMessage('Formatlama kütüphanesi yüklenemedi!', 'var(--error-color)');
        }
    }

    // BeautifyXSLT fonksiyonunu güncelle
    function beautifyXSLT(content) {
        try {
            // XML parser oluştur
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(content, 'text/xml');
            
            // Hata kontrolü
            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                throw new Error('Geçersiz XML/XSLT formatı');
            }

            // XML'i string'e dönüştür
            const serializer = new XMLSerializer();
            
            // CSS içeriğini bul ve formatla
            let formatted = serializer.serializeToString(xmlDoc);
            formatted = formatted.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (match, openTag, cssContent, closeTag) => {
                const beautifiedCSS = formatCSS(cssContent);
                return `${openTag}\n${beautifiedCSS}${closeTag}`;
            });

            let lines = formatted
                .replace(/>\s+</g, '>\n<') // Boşlukları temizle
                .replace(/</g, '\n<')      // Her tag'i yeni satıra al
                .split('\n')
                .filter(line => line.trim()); // Boş satırları kaldır

            formatted = '';
            let indent = 0;

            // Her satırı işle
            lines.forEach(line => {
                line = line.trim();
                
                // Kapanış tag'i veya self-closing tag kontrolü
                if (line.match(/<\/.+>/) || line.match(/<.*\/>$/)) {
                    indent = Math.max(0, indent - 1);
                }
                
                // Satırı girintiyle ekle
                if (line.length > 0) {
                    formatted += '  '.repeat(indent) + line + '\n';
                }
                
                // Açılış tag'i kontrolü (self-closing hariç)
                if (line.match(/<[^/].*[^/]>$/) && !line.match(/<.*\/>$/)) {
                    indent++;
                }
            });

            // XSLT özel elementlerini düzenle
            formatted = formatted
                // xsl:value-of elementlerini düzenle
                .replace(/<xsl:value-of\s+select="([^"]+)"\s*\/>/g, '<xsl:value-of select="$1"/>')
                // xsl:template elementlerini düzenle
                .replace(/<xsl:template\s+match="([^"]+)"\s*>/g, '<xsl:template match="$1">')
                // Boş satırları tek satıra indir
                .replace(/\n\s*\n/g, '\n')
                // Attribute'ları düzenle
                .replace(/\s+xmlns:xsl="([^"]+)"/g, ' xmlns:xsl="$1"')
                // Version attribute'unu düzenle
                .replace(/\s+version="([^"]+)"/g, ' version="$1"');

            // Son düzenlemeleri yap
            formatted = formatted
                .trim()                     // Baştaki ve sondaki boşlukları temizle
                .replace(/^\s+$/gm, '')     // Sadece boşluk içeren satırları temizle
                .replace(/\n{3,}/g, '\n\n') // Çoklu boş satırları iki satıra indir
                + '\n';                     // Sona yeni satır ekle

            return formatted;
        } catch (error) {
            throw new Error(`XSLT iyileştirme hatası: ${error.message}`);
        }
    }

    // CSS formatla fonksiyonu
    function formatCSS(css) {
        try {
            // Yorumları koru
            const comments = [];
            css = css.replace(/\/\*[\s\S]*?\*\//g, match => {
                comments.push(match);
                return `/*COMMENT${comments.length - 1}*/`;
            });

            // CSS'i temizle ve formatla
            css = css
                .replace(/\s+/g, ' ')           // Fazla boşlukları temizle
                .replace(/\s*{\s*/g, ' {\n')    // Açılış parantezinden sonra yeni satır
                .replace(/\s*}\s*/g, '\n}\n')   // Kapanış parantezinden önce ve sonra yeni satır
                .replace(/;\s*/g, ';\n')        // Noktalı virgülden sonra yeni satır
                .replace(/,\s*/g, ', ')         // Virgülden sonra tek boşluk
                .replace(/\s*:\s*/g, ': ')      // İki nokta üst üsteden sonra tek boşluk
                .replace(/\n\s+/g, '\n')        // Satır başındaki boşlukları temizle
                .split('\n')                    // Satırlara ayır
                .filter(line => line.trim())    // Boş satırları kaldır
                .map(line => {
                    // Girintileme
                    if (line.includes('{')) return '  ' + line.trim();
                    if (line.includes('}')) return line.trim();
                    if (!line.includes('}')) return '    ' + line.trim();
                    return line.trim();
                })
                .join('\n');

            // Yorumları geri ekle
            css = css.replace(/\/\*COMMENT(\d+)\*\//g, (match, index) => {
                return comments[parseInt(index)];
            });

            return css;
        } catch (error) {
            console.error('CSS formatlama hatası:', error);
            return css; // Hata durumunda orijinal CSS'i döndür
        }
    }

    // Yardımcı mesaj fonksiyonu
    function showMessage(message, color) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorMessage.style.backgroundColor = color;
        errorMessage.style.display = 'block';
        setTimeout(() => errorMessage.style.display = 'none', 3000);
    }

    // Beautify özelliğini başlat
    initBeautifyListener();

    // XML'den XSLT ayrıştırma işlevi
    function parseXSLTFromXML(xmlFile) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const xmlContent = e.target.result;
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

                        // Parse hatasını kontrol et
                        const parseError = xmlDoc.getElementsByTagName('parsererror');
                        if (parseError.length > 0) {
                            throw new Error('XML ayrıştırma hatası: ' + parseError[0].textContent);
                        }

                        // XSLT içeriğini işleme fonksiyonu
                        const processXSLTContent = (base64Content) => {
                            if (!base64Content) {
                                throw new Error('XSLT içeriği boş!');
                            }

                            // Base64 decode işlemi
                            const binaryString = atob(base64Content);
                            
                            // Binary string'i Uint8Array'e dönüştür
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            
                            // UTF-8 decoder ile metni çöz
                            let decodedContent = new TextDecoder('utf-8').decode(bytes);
                            
                            // BOM karakterini temizle
                            if (decodedContent.charCodeAt(0) === 0xFEFF) {
                                decodedContent = decodedContent.slice(1);
                            }
                            
                            // UTF-8 BOM kontrolü
                            if (decodedContent.startsWith('\uFEFF')) {
                                decodedContent = decodedContent.substring(1);
                            }
                            
                            // Başka bir BOM kontrolü
                            if (decodedContent.startsWith('\ufeff')) {
                                decodedContent = decodedContent.substring(1);
                            }

                            // XML bildirimini düzelt
                            if (decodedContent.includes('<?xml')) {
                                decodedContent = decodedContent.replace(/(^[\s\S]*?)(<\?xml[\s\S]*?\?>)/, '$2');
                            }

                            // Boş satırları temizle
                            decodedContent = decodedContent.replace(/^\s*[\r\n]/gm, '');
                            
                            // XSLT doğrulama
                            const xsltDoc = parser.parseFromString(decodedContent.trim(), "text/xml");
                            const xsltError = xsltDoc.getElementsByTagName('parsererror');
                            if (xsltError.length > 0) {
                                throw new Error('XSLT içeriği geçersiz: ' + xsltError[0].textContent);
                            }

                            return decodedContent;
                        };

                        // Namespace'leri tanımla
                        const namespaces = {
                            cac: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
                            cbc: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
                        };

                        // XSLT içeriğini bul (DocumentType kontrolü olmadan)
                        const xsltNodes = xmlDoc.evaluate(
                            "//cac:AdditionalDocumentReference/cac:Attachment/cbc:EmbeddedDocumentBinaryObject",
                            xmlDoc,
                            function(prefix) {
                                return namespaces[prefix] || null;
                            },
                            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                            null
                        );

                        if (xsltNodes.snapshotLength === 0) {
                            // Alternatif yöntem dene
                            const additionalDocs = xmlDoc.getElementsByTagNameNS(namespaces.cac, 'AdditionalDocumentReference');
                            let xsltNode = null;

                            for (let i = 0; i < additionalDocs.length; i++) {
                                const attachment = additionalDocs[i]
                                    .getElementsByTagNameNS(namespaces.cac, 'Attachment')[0];
                                if (attachment) {
                                    xsltNode = attachment
                                        .getElementsByTagNameNS(namespaces.cbc, 'EmbeddedDocumentBinaryObject')[0];
                                    if (xsltNode) break;
                                }
                            }

                            if (!xsltNode) {
                                throw new Error('XSLT ayrıştırılamadı! XML dosyasında EmbeddedDocumentBinaryObject elementi olmalı.');
                            }

                            resolve(processXSLTContent(xsltNode.textContent.trim()));
                        } else {
                            const xsltNode = xsltNodes.snapshotItem(0);
                            resolve(processXSLTContent(xsltNode.textContent.trim()));
                        }
                    } catch (error) {
                        showToast(error.message);
                        reject(new Error(`XSLT ayrıştırma hatası: ${error.message}`));
                    }
                };

                reader.onerror = () => {
                    const errorMsg = 'Dosya okuma hatası!';
                    showToast(errorMsg);
                    reject(new Error(errorMsg));
                };

                reader.readAsText(xmlFile, 'UTF-8');
            } catch (error) {
                showToast(error.message);
                reject(new Error(`Dosya işleme hatası: ${error.message}`));
            }
        });
    }

    // XML dosyası seçme işleyicisi
    async function handleXMLFileSelect(file) {
        try {
            const xsltContent = await parseXSLTFromXML(file);
            hideWelcomePopup();

            // Eğer hiç XML veri dosyası SEÇİLMEMİŞSE veya DEFAULT değer kullanılıyorsa
            if (selectedXmlData === null || selectedXmlData === undefined || selectedXmlData === '' || selectedXmlData.includes('<!--#!DFLT_XML!#-->')) {
                const reader = new FileReader();
                reader.onload = (file) => {
                    selectedXmlData = file.target.result;
                };
                reader.readAsText(file);                
                document.getElementById('selectedFileName').textContent = `Veri kaynağı: ${file.name} (Otomatik atandı)`;
                showToast('XML dosyası otomatik olarak veri kaynağı olarak kullanılıyor.', 'info');
            }
            
            // Editör yoksa başlat
            if (!editor) {
                editor = initEditor('editor');
                setupEditorChangeListener();
                setupEditor();
                initMenuFunctionality();
                
                // Editör temasını ayarla
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const editorTheme = currentTheme === 'light' ? 'ace/theme/chrome' : 'ace/theme/dracula';
                editor.setTheme(editorTheme);
            }
            
            editor.setValue(xsltContent);
            editor.clearSelection();
            editor.moveCursorTo(0, 0);

            // Arama işlevselliğini başlat
            initSearch();
            setupPreviewSearch();
            
            showToast('XSLT başarıyla ayrıştırıldı.', 'success');
            //showMessage('XSLT başarıyla ayrıştırıldı.', '#4CAF50');
        } catch (error) {
            console.error('XSLT ayrıştırma hatası:', error);
            showMessage(error.message, 'var(--error-color)');
        }
    }

    // Welcome popup'ı gizleme fonksiyonu
    function hideWelcomePopup() {
        document.getElementById('welcome-popup').style.display = 'none';
        const container = document.querySelector('.container');
            container.style.display = 'flex';
        
        // Editörü başlat
        if (!editor) {
            editor = initEditor('editor');
            editor.setValue(defaultXSLT); // Varsayılan XSLT şablonunu yükle
            editor.clearSelection();
            editor.moveCursorTo(0, 0);
            
            setupEditorChangeListener();
            setupEditor();
            initMenuFunctionality();
            
            // Editör temasını ayarla
            const currentTheme = document.documentElement.getAttribute('data-theme');
            editor.setTheme(currentTheme === 'light' ? 'ace/theme/chrome' : 'ace/theme/dracula');
            
            // İlk önizlemeyi göster
            updatePreview(defaultXSLT);
        }
        
        // Dil seçiciyi gizle
        document.querySelector('.language-selector').style.display = 'none';
    }

    // Toast mesajı gösterme fonksiyonu
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Dil seçimi işlemleri
    const languageSelector = document.querySelector('.language-selector');
    const languageOptions = document.querySelectorAll('.language-option');
    let currentLanguage = localStorage.getItem('selectedLanguage') || 'tr';

    // Dil seçicinin açılıp kapanması için click event listener
    languageSelector.addEventListener('click', function(e) {
        const isOption = e.target.closest('.language-option');
        
        // Eğer bir dil seçeneğine tıklanmadıysa (yani ana container'a tıklandıysa)
        if (!isOption) {
            this.classList.toggle('expanded');
            return;
        }

        // Eğer bir dil seçeneğine tıklandıysa
        if (isOption) {
            const lang = isOption.dataset.lang;
            changeLanguage(lang);
            // Seçim yapıldıktan sonra menüyü kapat
            setTimeout(() => {
                this.classList.remove('expanded');
            }, 300);
        }
    });

    // Dil seçici dışında bir yere tıklandığında menüyü kapat
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.language-selector')) {
            languageSelector.classList.remove('expanded');
        }
    });
});
