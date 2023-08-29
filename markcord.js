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
    regexRulees: { // unported rules, will remove when v2 is complete
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
        deescape: [/\\(?<!\\\\)[\*~_\\\/\|#]/g, match => match.slice(1)],
        declutterUnorderedLists: [/<\/ul>\s?<ul class="markcord-ul">/g, ""],
        newLineTransformer: [/(?<!<)\n(?!>)/g, "<br>"],
    },
    regexRules: {
        underline: [/__(?!_)([\s\S]+?(?<!\\))__/, result => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[1], "underline", []]
        }],
        header: [/^(#{1,3}) (.+)$/, result => [result[2], "header", [], result[1].length]],
        unorderedList: [/^(-|\*) (.+)$/, result => [result[2], "unorderedList", [], result[1]]],
        quote: [/^&gt; (.+)$/, result => [result[1], "blockquote", []]],
        pre: [/(`+)([\s\S]*?[^`])\1(?!`)/, result => { // regex stolen (and modified) from simple-markdown :troll:
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[2], "pre", [], result[1]]
        }],
        codeblock: [/```(?:([a-z0-9-]+?)\n+)?\n*([^]+?)```/, result => { // regex stolen (and modified) from ItzDerock/discord-markdown-parser :troll:
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[2], "codeblock", [], result[1]]
        }],
        strikethrough: [/~~(?!~)([\s\S]+)(?<!\\)~~(?!_)/g, result => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[1], "strikethrough", []]
        }],
        bold: [/\*\*(?!\*)([\s\S]+?)(?<!\\)\*\*/, result => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[1], "bold", []]
        }],
        italic: [/(\*|_)(?!\*|_)([\s\S]+?)(?<!\\)\1/, result => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[2], "italic", [], result[1]]
        }],
        spoiler: [/\|\|(?!\|)([\s\S]+?)\|\|/, result => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[1], "spoiler", []]
        }],
    },  
    types: {},
    renderers: {
        text: node => node[0],
        underline: node => node[2].includes("underline") ? `__${node[0]}__` : `<u class="markcord-underline">${node[0]}</u>`,
        header: node => {
            if (node[2].includes("header")) {
                return `${"#".repeat(node[3])} ${node[0]}`
            } else {
                const h = node[3] + markcord.headerOffset
                return `<h${h} class="markcord-header">${node[0]}</h${h}>`
            }
        },
        unorderedList: node => node[2].filter(item => item === "unorderedList").length > 8 
                        ? `${node[3]} ${node[0]}` 
                        : `<ul class="markcord-ul"><li class="markcord-li">${node[1]}</li></ul>`,
        quote: node => node[2].includes("quote") ? `&gt; ${node[0]}` : `<blockquote class="markcord-quote">${node[1]}</blockquote>`,
        pre: node => node[2].includes("pre") ? `${node[3]}${node[0]}${node[3]}` : `<pre class="markcord-pre">${node[1]}</pre>`,
        codeblock: node => node[2].includes("codeblock") 
                           ? `\`\`\`${node[0]}\`\`\`` 
                           : `<pre class="markcord-pre"><code class="markcord-code language-${node[3]}">${node[1]}</code></pre>`,
        strikethrough: node => node[2].includes("strikethrough") ? `~~${node[0]}~~` : `<s class="markcord-strikethrough">${node[0]}</s>`,
        bold: node => node[2].includes("bold") ? `**${node[0]}**` : `<strong class="markcord-bold">${node[0]}</strong>`,
        italic: node => node[2].includes("italic") ? `${node[3]}${node[0]}${node[3]}` : `<em class="markcord-italic">${node[0]}</em>`,
        spoiler: node => node[2].includes("spoiler") 
                         ? `||${node[0]}||` 
                         : `<span class="markcord-spoiler" onclick="markcord.revealSpoiler(this);">${node[0]}</span>`,
    },
    extendNode: node => {
        const rules = markcord.types[node[1]] || markcord.types.all
        const extendedNode = [...node]
        extendedNode[0] = []
        let string = node[0]
        if (typeof(node[0]) === "string") {
            let matched
            rules.forEach(rule => {
                const result = rule[0].exec(string)
                if (result) {
                    matched = true
                    const newNode = rule[1](result)
                    newNode[2] = [...node[2], node[1]]
                    if (result.index != 0) {
                        extendedNode[0].push([string.slice(0, result.index), "text", [...node[2], node[1]]])
                    }
                    extendedNode[0].push(newNode)
                    string = string.slice(result.index + result[0].length)
                }
            })
            if (!matched) {
                extendedNode[0] = node[0]
            }
        } else {
            node[0].forEach(newNode => extendedNode[0].push(markcord.extendNode(newNode)))
        }
        return extendedNode
    },
    parse: function (text) {
        let cleaned = [this.clean(text).trim(), "text", []]
        
        return cleaned[0]
    }
}
markcord.types.all = [
    markcord.regexRules.header,
    markcord.regexRules.unorderedList,
    markcord.regexRules.quote,
    markcord.regexRules.underline,
    markcord.regexRules.strikethrough, 
    markcord.regexRules.bold,
    markcord.regexRules.italic,
    markcord.regexRules.spoiler
]
