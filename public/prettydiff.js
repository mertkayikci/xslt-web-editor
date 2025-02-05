;(function(window) {
    'use strict';
    
    const prettydiff = {
        beautify: {
            xml: function(source, options = {}) {
                return formatXSLT(source, options);
            },
            xsl: function(source, options = {}) {
                return formatXSLT(source, options);
            },
            html: function(source, options = {}) {
                return formatHTML(source, options);
            }
        }
    };

    function createIndent(level, settings) {
        if (level < 0) level = 0;
        return settings.indent_char.repeat(level * settings.indent_size);
    }

    function getDefaultSettings(options) {
        return {
            source: options.source || '',
            indent_size: options.indent_size || 2,
            indent_char: options.indent_char || ' ',
            max_preserve_newlines: options.max_preserve_newlines || 2,
            wrap_line_length: options.wrap_line_length || 0,
            preserve_newlines: options.preserve_newlines !== false,
            indent_scripts: options.indent_scripts || 'normal' // keep, separate, normal
        };
    }

    // XSLT özel etiketler tanımı
    const xsltTags = {
        'xsl:stylesheet': { indent: true, preserveSpace: false },
        'xsl:template': { indent: true, preserveSpace: false },
        'xsl:param': { indent: false, preserveSpace: false },
        'xsl:variable': { indent: false, preserveSpace: false },
        'xsl:text': { indent: false, preserveSpace: true },
        'xsl:value-of': { indent: false, preserveSpace: false },
        'xsl:attribute': { indent: false, preserveSpace: false },
        'xsl:element': { indent: true, preserveSpace: false },
        'xsl:for-each': { indent: true, preserveSpace: false },
        'xsl:if': { indent: true, preserveSpace: false },
        'xsl:choose': { indent: true, preserveSpace: false },
        'xsl:when': { indent: true, preserveSpace: false },
        'xsl:otherwise': { indent: true, preserveSpace: false },
        'xsl:comment': { indent: false, preserveSpace: true },
        'xsl:copy': { indent: true, preserveSpace: false },
        'xsl:copy-of': { indent: false, preserveSpace: false },
        'xsl:apply-templates': { indent: false, preserveSpace: false }
    };

    function formatXSLT(source, options = {}) {
        const settings = getDefaultSettings(options);
        let formatted = '';
        let indent = 0;
        let inPreserveSpace = false;
        let inCDATA = false;
        let inComment = false;
        let consecutiveNewlines = 0;

        // Satırlara böl ve normalize et
        const lines = source.trim()
            .replace(/>\s*</g, '>\n<')
            .replace(/<!--[\s\S]*?-->/g, match => match.replace(/\n/g, '⏎'))
            .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, match => match.replace(/\n/g, '⏎'))
            .split('\n');

        for (let line of lines) {
            try {
                line = line.trim();
                if (!line) {
                    if (settings.preserve_newlines) {
                        consecutiveNewlines++;
                        if (consecutiveNewlines <= settings.max_preserve_newlines) {
                            formatted += '\n';
                        }
                    }
                    continue;
                }
                consecutiveNewlines = 0;

                // CDATA kontrolü
                if (line.includes('<![CDATA[')) {
                    inCDATA = true;
                    formatted += createIndent(indent, settings) + line.replace('⏎', '\n') + '\n';
                    continue;
                }
                if (line.includes(']]>')) {
                    inCDATA = false;
                    formatted += createIndent(indent, settings) + line.replace('⏎', '\n') + '\n';
                    continue;
                }
                if (inCDATA) {
                    formatted += createIndent(indent + 1, settings) + line.replace('⏎', '\n') + '\n';
                    continue;
                }

                // Yorum kontrolü
                if (line.startsWith('<!--')) {
                    inComment = true;
                    formatted += createIndent(indent, settings) + line.replace('⏎', '\n') + '\n';
                    continue;
                }
                if (line.endsWith('-->')) {
                    inComment = false;
                    formatted += createIndent(indent, settings) + line.replace('⏎', '\n') + '\n';
                    continue;
                }
                if (inComment) {
                    formatted += createIndent(indent + 1, settings) + line.replace('⏎', '\n') + '\n';
                    continue;
                }

                // XSLT etiket kontrolü
                let isXSLTTag = false;
                let tagName = '';
                const xsltMatch = line.match(/<\/?(?:xsl:[\w-]+)/);
                if (xsltMatch) {
                    tagName = xsltMatch[0].replace(/[<\/]/, '');
                    isXSLTTag = true;
                }

                // Kapanış etiketi
                if (line.startsWith('</')) {
                    if (!inPreserveSpace) {
                        indent = Math.max(0, indent - 1);
                    }
                    formatted += createIndent(indent, settings) + line + '\n';
                    if (isXSLTTag && xsltTags[tagName]?.preserveSpace) {
                        inPreserveSpace = false;
                    }
                }
                // Kendini kapatan etiket
                else if (line.endsWith('/>')) {
                    formatted += createIndent(indent, settings) + line + '\n';
                }
                // Açılış etiketi
                else if (line.startsWith('<')) {
                    formatted += createIndent(indent, settings) + line + '\n';
                    if (isXSLTTag) {
                        if (xsltTags[tagName]?.preserveSpace) {
                            inPreserveSpace = true;
                        }
                        if (xsltTags[tagName]?.indent && !line.endsWith('/>')) {
                            indent++;
                        }
                    } else if (!inPreserveSpace && !line.endsWith('/>')) {
                        indent++;
                    }
                }
                // Metin içeriği
                else {
                    if (inPreserveSpace) {
                        formatted += createIndent(indent, settings) + line + '\n';
                    } else {
                        if (settings.wrap_line_length > 0 && line.length > settings.wrap_line_length) {
                            const words = line.split(/\s+/);
                            let currentLine = '';
                            for (const word of words) {
                                if (currentLine.length + word.length + 1 > settings.wrap_line_length) {
                                    formatted += createIndent(indent, settings) + currentLine.trim() + '\n';
                                    currentLine = word + ' ';
                                } else {
                                    currentLine += word + ' ';
                                }
                            }
                            if (currentLine.trim()) {
                                formatted += createIndent(indent, settings) + currentLine.trim() + '\n';
                            }
                        } else {
                            formatted += createIndent(indent, settings) + line + '\n';
                        }
                    }
                }

            } catch (error) {
                console.error('XSLT formatlama hatası:', error);
                formatted += line + '\n';
            }
        }

        return formatted.trim()
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s+$/gm, '');
    }

    function formatHTML(source, options = {}) {
        const settings = getDefaultSettings(options);
        let formatted = '';
        let indent = 0;
        let inScript = false;
        let inStyle = false;
        let inPre = false;
        let consecutiveNewlines = 0;

        // HTML özel etiketler
        const htmlTags = {
            'script': { indent: true, preserveContent: true },
            'style': { indent: true, preserveContent: true },
            'pre': { indent: true, preserveContent: true },
            'textarea': { indent: true, preserveContent: true },
            // Blok elementler
            'div': { indent: true },
            'p': { indent: true },
            'header': { indent: true },
            'footer': { indent: true },
            'section': { indent: true },
            'article': { indent: true },
            'nav': { indent: true },
            'aside': { indent: true },
            'form': { indent: true },
            'table': { indent: true },
            'thead': { indent: true },
            'tbody': { indent: true },
            'tr': { indent: true },
            'ul': { indent: true },
            'ol': { indent: true },
            'dl': { indent: true },
            // Satır içi elementler
            'span': { indent: false },
            'a': { indent: false },
            'img': { indent: false },
            'input': { indent: false },
            'label': { indent: false },
            'strong': { indent: false },
            'em': { indent: false },
            'br': { indent: false },
            'hr': { indent: false }
        };

        // Satırlara böl ve normalize et
        const lines = source.trim()
            .replace(/>\s*</g, '>\n<')
            .replace(/<!--[\s\S]*?-->/g, match => match.replace(/\n/g, '⏎'))
            .split('\n');

        for (let line of lines) {
            try {
                line = line.trim();
                if (!line) {
                    if (settings.preserve_newlines && !inScript && !inStyle && !inPre) {
                        consecutiveNewlines++;
                        if (consecutiveNewlines <= settings.max_preserve_newlines) {
                            formatted += '\n';
                        }
                    }
                    continue;
                }
                consecutiveNewlines = 0;

                // Yorum kontrolü
                if (line.startsWith('<!--')) {
                    formatted += createIndent(indent, settings) + line.replace('⏎', '\n') + '\n';
                    continue;
                }
                if (line.endsWith('-->')) {
                    formatted += createIndent(indent, settings) + line.replace('⏎', '\n') + '\n';
                    continue;
                }

                // Etiket kontrolü
                let isOpeningTag = line.startsWith('<') && !line.startsWith('</');
                let isClosingTag = line.startsWith('</');
                let isSelfClosingTag = line.endsWith('/>');
                let tagName = '';

                // Etiket adını al
                const tagMatch = line.match(/<\/?([a-zA-Z0-9-]+)/);
                if (tagMatch) {
                    tagName = tagMatch[1].toLowerCase();
                }

                // Özel içerik durumlarını kontrol et
                if (isOpeningTag && tagName === 'script') inScript = true;
                if (isClosingTag && tagName === 'script') inScript = false;
                if (isOpeningTag && tagName === 'style') inStyle = true;
                if (isClosingTag && tagName === 'style') inStyle = false;
                if (isOpeningTag && tagName === 'pre') inPre = true;
                if (isClosingTag && tagName === 'pre') inPre = false;

                // İçerik korumalı etiketlerin içindeyken
                if ((inScript || inStyle || inPre) && !isOpeningTag && !isClosingTag) {
                    formatted += createIndent(indent + 1, settings) + line + '\n';
                    continue;
                }

                // Kapanış etiketi
                if (isClosingTag) {
                    if (htmlTags[tagName]?.indent) {
                        indent = Math.max(0, indent - 1);
                    }
                    formatted += createIndent(indent, settings) + line + '\n';
                }
                // Kendini kapatan etiket
                else if (isSelfClosingTag) {
                    formatted += createIndent(indent, settings) + line + '\n';
                }
                // Açılış etiketi
                else if (isOpeningTag) {
                    formatted += createIndent(indent, settings) + line + '\n';
                    if (htmlTags[tagName]?.indent && !isSelfClosingTag) {
                        indent++;
                    }
                }
                // Metin içeriği
                else {
                    if (settings.wrap_line_length > 0 && line.length > settings.wrap_line_length) {
                        const words = line.split(/\s+/);
                        let currentLine = '';
                        for (const word of words) {
                            if (currentLine.length + word.length + 1 > settings.wrap_line_length) {
                                formatted += createIndent(indent, settings) + currentLine.trim() + '\n';
                                currentLine = word + ' ';
                            } else {
                                currentLine += word + ' ';
                            }
                        }
                        if (currentLine.trim()) {
                            formatted += createIndent(indent, settings) + currentLine.trim() + '\n';
                        }
                    } else {
                        formatted += createIndent(indent, settings) + line + '\n';
                    }
                }

            } catch (error) {
                console.error('HTML formatlama hatası:', error);
                formatted += line + '\n';
            }
        }

        return formatted.trim()
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s+$/gm, '');
    }

    // Global scope'a ekle
    window.prettydiff = prettydiff;
    
    // AMD ve CommonJS desteği
    if (typeof define === 'function' && define.amd) {
        define(function() { return prettydiff; });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = prettydiff;
    }
    
})(typeof window !== 'undefined' ? window : this); 