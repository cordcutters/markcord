const markcord = {
    cleaner: document.createElement("p"),
    cdn: "https://cdn.discordapp.com",
    headerOffset: 1,
    allowedProtocols: ["https:", "http:"],
    clean: function (text) {
        this.cleaner.textContent = text;
        const cleaned = this.cleaner.innerHTML;
        this.cleaner.innerHTML = ""
        return cleaned
    },
    emoteError: function (self) {
        self.replaceWith(document.createTextNode(`:${self.attributes.name.value}:`))
    },
    interceptLink: function (self, event) {
        // override this function to intercept link clicks
    },
    revealSpoiler: function (self) {
        if (!self.className.includes("markcord-revealed")) {
            self.className += " markcord-revealed"
        }
    },
    regexRules: {
        header: [/^(?<!markcord-header">\s)(#{1,3}) (.+)$/gm, (_, p1, p2) => {
            const h = p1.length + markcord.headerOffset
            return `<h${h} class="markcord-header">
${p2}</h${h}>`
        }],
        unorderedList: [/^(?<!(<ul class="markcord-ul"><li class="markcord-li">\s){8,}) +?(-|\*) (.+)$/gm, (_, __, ___, p3) => {
            return `<ul class="markcord-ul"><li class="markcord-li">
${p3}
</li></ul>`
        }],
        quote: [/^(?<!markcord-quote">\s) +?&gt; (.+)$/gm, (_, p1) => {
            return `<blockquote class="markcord-quote">
${p1}
</blockquote>`
        }],
        underline: [/__(?!_)[\s\S]+?(?<!\\)__/g, (match, offset, string) => {
            if (string[offset - 1] == "\\" && string[offset - 2] != "\\") {
                return `_\\_${match.slice(2, -2)}\\_\\_`
            }
            return `<u class="markcord-underline">${match.slice(2, -2)}</u>`
        }],
        strikethrough: [/~~(?!~)[\s\S]+?(?<!\\)~~(?!_)/g, (match, offset, string) => {
            if (string[offset - 1] == "\\" && string[offset - 2] != "\\") {
                return `~\\~${match.slice(2, -2)}\\~\\~`
            }
            return `<s class="markcord-strikethrough">${match.slice(2, -2)}</s>`
        }],
        bold: [/\*\*(?!\*)[\s\S]+?(?<!\\)\*\*/g, (match, offset, string) => {
            if (string[offset - 1] == "\\" && string[offset - 2] != "\\") {
                return `*\\*${match.slice(2, -2)}\\*\\*`
            }
            return `<strong class="markcord-bold">${match.slice(2, -2)}</strong>`
        }],
        italic: [/\*(?!\*)[\s\S]+?(?<!\\)\*/g, (match, offset, string) => {
            if (string[offset - 1] == "\\" && string[offset - 2] != "\\") {
                return `*${match.slice(1, -1)}\\*`
            }
            return `<em class="markcord-italic">${match.slice(1, -1)}</em>`
        }],
        italic2: [/_(?!_)[\s\S]+?(?<!\\)_/g, (match, offset, string) => {
            if (string[offset - 1] == "\\" && string[offset - 2] != "\\") {
                return `_${match.slice(1, -1)}\\_`
            }
            return `<em class="markcord-italic">${match.slice(1, -1)}</em>`
        }],
        emoji: [/&lt;a?:([a-zA-Z0-9_]{2,32}):([0-9]{17,})&gt;/g, (match, p1, p2) => {
            return `<img src="${markcord.cdn}/emojis/${p2}.${(match.slice(0, 5) == "&lt;a") ? "gif" : "webp"}?size=44&quality=lossless" class="${(window.__markcord_other_text ? "" : "markcord-big ") + "markcord-emoji"}" name="${p1}" onerror="markcord.emoteError(this);"> `
        }],
        maskedURLs: [/\[(.+)\]\((https?:\/\/[-a-zA-Z0-9@:%._\+~#=/?(&amp;)]+)\)/g, (match, p1, p2, offset, string, options) => {
            if (string[offset - 1] == "\\" && string[offset - 2] != "\\") {
                return match
            }
            try {
                const url = new URL(p1)
                if (markcord.allowedProtocols.includes(url.protocol)) {
                    return match
                }
                throw new Error
            } catch (e) {
                try {
                    p2 = p2.replaceAll("&amp;", "&")
                    const url = new URL(p2)
                    if (!markcord.allowedProtocols.includes(url.protocol)) {
                        return match
                    }
                    return `<a href="${p2}" class="markcord-url markcord-masked${options.noembed ? " markcord-noembed" : ""}" target="_blank" rel="noopener noreferrer" onclick="markcord.interceptLink(this, event);">${p1}</a>`.replaceAll(...markcord.regexRules.escapeCharacters)
                } catch (e) {
                    return match
                }
            }
        }],
        noEmbedMaskedURLs: [/\[(.+)\]\(&lt;(https?:\/\/[-a-zA-Z0-9@:%._\+~#=/?(&amp;)]+)&gt;\)/g, (match, p1, p2, offset, string) => markcord.regexRules.maskedURLs[1](match, p1, p2, offset, string, {noembed: true})],
        URLs: [/(?<!<a href=")(?<!<img src=")(?<!this, event\);">)https?:\/\/[-a-zA-Z0-9@:%._\+~#=/?(&amp;)]+/g, (match, options) => {
            try {
                match = match.replaceAll("&amp;", "&")
                new URL(match)
                return `<a href="${match}" class="markcord-url${options.noembed ? " markcord-noembed" : ""}" target="_blank" rel="noopener noreferrer" onclick="markcord.interceptLink(this, event);">${match}</a>`.replaceAll(...markcord.regexRules.escapeCharacters)
            } catch (e) {
                return match
            }
        }],
        noEmbedURLs: [/(?<!<a href=")(?<!<img src=")(?<!this, event\);">)&lt;(https?:\/\/[-a-zA-Z0-9@:%._\+~#=/?(&amp;)]+)&gt;/g, (_, p1) => markcord.regexRules.URLs[1](p1, {noembed: true})],
        spoiler: [/\|\|(?!\|)[\s\S]+?\|\|/g, (match, offset, string) => {
            if (string[offset - 1] == "\\" && string[offset - 2] != "\\") {
                return `||${match.slice(2, -2)}|\\|`
            }
            return `<span class="markcord-spoiler" onclick="markcord.revealSpoiler(this);">${match.slice(2, -2)}</span>`
        }],
        deescape: [/\\(?<!\\\\)[\*~_\\\/\|#]/g, match => match.slice(1)],
        declutterUnorderedLists: [/<\/ul>\s?<ul class="markcord-ul">/g, ""],
        newLineTransformer: [/(?<!<)\n(?!>)/g, "<br>"],
        escapeCharacters: [/[\*_|~]/g, match => "\\" + match],
        noExtraNewline: [/(<li class="markcord-li">| class="markcord-header">|<blockquote class="markcord-quote">)<br>/g, (_, p1) => p1]
    },
    rulesets: [],
    parse: function (text) {
        let cleaned = this.clean(text)
        window.__markcord_other_text = cleaned.replaceAll(this.regexRules.emoji[0], "").trim() !== ""
        this.rulesets.forEach(ruleset => {
            ruleset.forEach(rule => {
                let previous = "";
                while (previous !== cleaned) {
                    previous = cleaned
                    cleaned = cleaned.replaceAll(...rule)
                }
            })
        })
        return cleaned
    }
}
markcord.firstRun = [
    markcord.regexRules.noEmbedMaskedURLs,
    markcord.regexRules.maskedURLs,
    markcord.regexRules.noEmbedURLs,
    markcord.regexRules.URLs, 
    markcord.regexRules.header,
    markcord.regexRules.unorderedList,
    markcord.regexRules.quote,
    markcord.regexRules.underline,
    markcord.regexRules.strikethrough, 
    markcord.regexRules.bold,
    markcord.regexRules.italic,
    markcord.regexRules.italic2,
    markcord.regexRules.emoji,
    markcord.regexRules.spoiler
]
markcord.secondRun = [
    markcord.regexRules.header,
    markcord.regexRules.unorderedList,
    markcord.regexRules.quote
]
markcord.cleanupRun = [
    markcord.regexRules.deescape,
    markcord.regexRules.declutterUnorderedLists,
    markcord.regexRules.newLineTransformer,
    markcord.regexRules.noExtraNewline
]
markcord.rulesets = [markcord.firstRun, markcord.secondRun, markcord.cleanupRun]
