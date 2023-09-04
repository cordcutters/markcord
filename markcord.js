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
        deescape: [/\\(?<!\\\\)[\*~_\\\/\|#]/g, match => match.slice(1)],
        declutterUnorderedLists: [/<\/ul>\s?<ul class="markcord-ul">/g, ""],
        newLineTransformer: [/\n/g, "<br>"],
        underline: [/__(?!_)([\s\S]+?(?<!\\))__/, result => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[1], "underline", []]
        }],
        header: [/^(#{1,3}) (.+)$/m, result => [result[2], "header", [], result[1].length]],
        unorderedList: [/^ *?(-|\*) (.+)$/m, result => [result[2], "unorderedList", [], result[1]]],
        quote: [/^&gt; (.+)$/m, result => [result[1], "quote", []]],
        pre: [/(`+)([\s\S]*?[^`])\1(?!`)/, result => { // regex stolen (and modified) from simple-markdown :troll:
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[2], "pre", [], result[1]]
        }, "pre"],
        codeblock: [/```(?:([a-z0-9-]+?)\n+)?\n*([^]+?)```/, result => { // regex stolen (and modified) from ItzDerock/discord-markdown-parser :troll:
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[2], "codeblock", [], result[1]]
        }, "codeblock"],
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
        bolditalic: [/(?:(\*|_)\*\*(?!\*)([\s\S]+?)(?<!\\)\*\*\1)|(?:\*\*(\*|_)(?!\*)([\s\S]+?)(?<!\\)\3\*\*)/, result => { // cursed but im too lazy to fix the core issue
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[2] ? result[2] : result[4], "bolditalic", [], result[1] ? result[1] : result[2], result[0].slice(2, 3)]
        }],
        spoiler: [/\|\|(?!\|)([\s\S]+?)\|\|/, result => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[1], "spoiler", []]
        }],
        emoji: [/&lt;(a)?:([a-zA-Z0-9_]{2,32}):([0-9]{17,})&gt;/, result => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            return [result[2], "emoji", [], result[1], result[3]]
        }],
        URLs: [/https?:\/\/(?:[-a-zA-Z0-9@:%._\+~#=/?]|&amp;)+/, (result, noembed) => {
            let content = noembed ? result[1] : result[0]
            content = content.replaceAll("&amp;", "&")
            try {
                new URL(content)
                return [content, "url", [], noembed]
            } catch (e) {
                return [content, "escapedText", []]
            }
        }, "URLs"],
        noEmbedURLs: [/&lt;(https?:\/\/(?:[-a-zA-Z0-9@:%._\+~#=/?]|&amp;)+)&gt;/, result => markcord.regexRules.URLs[1](result, true), "noEmbedURLs"],
        maskedURLs: [/\[(.+)\]\((https?:\/\/(?:[-a-zA-Z0-9@:%._\+~#=/?]|&amp;)+)\)/, (result, noembed) => {
            if (result.input[result.index - 1] == "\\" && result.input[result.index - 2] != "\\") {
                return [result[0], "escapedText", []]
            }
            try {
                const url = new URL(result[1])
                if (markcord.allowedProtocols.includes(url.protocol)) {
                    return [result[0], "escapedText", []]
                }
                throw new Error
            } catch (e) {
                try {
                    let value = result[2]
                    value = value.replaceAll("&amp;", "&")
                    const url = new URL(value)
                    if (!markcord.allowedProtocols.includes(url.protocol)) {
                        return [result[0], "escapedText", []]
                    }
                    return [result[1], "maskedurl", [], result[2], noembed]
                } catch (e) {
                    return [result[0], "escapedText", []]
                }
            }
        }, "maskedURLs"],
        noEmbedMaskedURLs: [/\[(.+)\]\(&lt;(https?:\/\/(?:[-a-zA-Z0-9@:%._\+~#=/?]|&amp;)+)&gt;\)/, result => markcord.regexRules.maskedURLs[1](result, true), "noEmbedMaskedURLs"]
    },  
    types: {
        url: [],
        maskedurl: [],
        emoji: [],
        escapedText: [],
        codeblock: [],
        pre: []
    },
    postprocessingRules: [],
    renderers: {
        text: node => node[0].replaceAll(...markcord.regexRules.newLineTransformer),
        escapedText: node => node[0],
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
                        : `<ul class="markcord-ul"><li class="markcord-li">${node[0]}</li></ul>`,
        quote: node => node[2].includes("quote") ? `&gt; ${node[0]}` : `<blockquote class="markcord-quote">${node[0]}</blockquote>`,
        pre: node => node[2].includes("pre") ? `${node[3]}${node[0]}${node[3]}` : `<pre class="markcord-pre">${node[0].replaceAll("\n", "<<N>>")}</pre>`,
        codeblock: node => node[2].includes("codeblock") 
                           ? `\`\`\`${node[0]}\`\`\`` 
                           : `<pre class="markcord-pre"><code class="markcord-code${node[3] ? " language-" + node[3] : ""}">${node[0].replaceAll("\n", "<<N>>")}</code></pre>`,
        strikethrough: node => node[2].includes("strikethrough") ? `~~${node[0]}~~` : `<s class="markcord-strikethrough">${node[0]}</s>`,
        bold: node => node[2].includes("bold") ? `**${node[0]}**` : `<strong class="markcord-bold">${node[0]}</strong>`,
        italic: node => node[2].includes("italic") ? `${node[3]}${node[0]}${node[3]}` : `<em class="markcord-italic">${node[0]}</em>`,
        bolditalic: node => node[2].includes("bolditalic") 
                    ? `${node[3]}*${node[4]}${node[0]}${node[3]}*${node[4]}` 
                    : `<strong class="markcord-bold"><em class="markcord-italic">${node[0]}</em></strong>`,
        spoiler: node => node[2].includes("spoiler") 
                         ? `||${node[0]}||` 
                         : `<span class="markcord-spoiler" onclick="markcord.revealSpoiler(this);">${node[0]}</span>`,
        emoji: node => `<img src="${markcord.cdn}/emojis/${node[4]}.${(node[3] === "a") ? "gif" : "webp"}?size=44&quality=lossless" class="${(window.__markcord_other_text ? "" : "markcord-big ") + "markcord-emoji"}" name="${node[0]}" onerror="markcord.emoteError(this);">`,
        url: node => `<a href="${node[0]}" class="markcord-url${node[3] ? " markcord-noembed" : ""}" target="_blank" rel="noopener noreferrer" onclick="markcord.interceptLink(this, event);">${node[0]}</a>`,
        maskedurl: node => `<a href="${node[3]}" class="markcord-url markcord-masked${node[4] ? " markcord-noembed" : ""}" target="_blank" rel="noopener noreferrer" onclick="markcord.interceptLink(this, event);">${node[0]}</a>`
    },
    extendNode: node => {
        const rules = markcord.types[node[1]] || markcord.types.all
        const extendedNode = [...node]
        extendedNode[0] = []
        let string = node[0]
        if (typeof(node[0]) === "string") {
            const originalString = string
            let ruleOrder = [ ...rules ].filter(item => !markcord.types.highPriorityRuleNames.includes(item[2]))
            ruleOrder = [
                ...markcord.types.highPriorityRules.filter(item => rules.includes(item)),
                ...ruleOrder
            ]
            ruleOrder = ruleOrder.map(rule => [rule[0].exec(string), rule]).filter(item => item[0] !== null).sort((a, b) => b[0][0].length - a[0][0].length)
            if (ruleOrder.length === 0) {
                extendedNode[0] = node[0]
            } else {
                ruleOrder.forEach(ruleset => { 
                    let result = []
                    let previous;
                    while (result !== previous && result) {
                        previous = result   
                        result = string === originalString ? ruleset[0] : ruleset[1][0].exec(string)
                        if (!result) {
                            break
                        }
                        const newNode = ruleset[1][1](result)
                        newNode[2] = [...node[2], node[1]]
                        if (result.index != 0) {
                            extendedNode[0].push([string.slice(0, result.index), "text", [...node[2], node[1]]])
                        }
                        extendedNode[0].push(newNode)
                        string = string.slice(result.index + result[0].length)
                    }
                })
                if (string.trim() != "") {
                    extendedNode[0].push([string, "text", [...node[2], node[1]]])
                }
            }
        } else {
            node[0].forEach(newNode => extendedNode[0].push(markcord.extendNode(newNode)))
        }
        if (typeof(extendedNode[0]) !== "string") {
            const newExtendedNode = [...extendedNode]
            newExtendedNode[0] = []
            extendedNode[0].forEach(newNode => newExtendedNode[0].push(markcord.extendNode(newNode)))
            return newExtendedNode
        }
        return extendedNode
    },
    renderNode: node => {
        if (typeof(node[0]) === "string") {
            return markcord.renderers[node[1]](node)
        } else {
            node[0] = node[0].map(markcord.renderNode)
            if (node[0].length === 1) {
                node[0] = node[0][0]
            } else if (node[0].filter(item => typeof(item) === "string").length === node[0].length) {
                node[0] = node[0].join("") 
            }
            return markcord.renderNode(node)    
        }
    },
    parseText: (text, startingNodeType) => markcord.renderNode(markcord.extendNode([text, startingNodeType, []])),
    parse: function (text, startingNodeType = "text") {
        let cleaned = this.clean(text).trim()
        window.__markcord_other_text = cleaned.replaceAll(/&lt;(a)?:([a-zA-Z0-9_]{2,32}):([0-9]{17,})&gt;/g, "").trim() !== "" // has to be a global regex
        cleaned = this.parseText(cleaned, startingNodeType)
        this.postprocessingRules.forEach(rule => {
            let previous;
            while (previous !== cleaned) {
                previous = cleaned
                cleaned = cleaned.replaceAll(...rule)
            }
        })
        return cleaned
    },
    except: (what, inside) => inside.filter(item => item !== what)
}
markcord.types.highPriorityRuleNames = ["codeblock", "pre", "noEmbedMaskedURLs", "maskedURLs", "noEmbedURLs", "URLs"]
markcord.types.highPriorityRules = [
    markcord.regexRules.codeblock,
    markcord.regexRules.pre,
    markcord.regexRules.noEmbedMaskedURLs,
    markcord.regexRules.maskedURLs,
    markcord.regexRules.noEmbedURLs,
    markcord.regexRules.URLs
]
markcord.types.generic = [
    markcord.regexRules.noEmbedMaskedURLs,
    markcord.regexRules.maskedURLs,
    markcord.regexRules.noEmbedURLs,
    markcord.regexRules.URLs,
    markcord.regexRules.underline,
    markcord.regexRules.strikethrough,
    markcord.regexRules.bolditalic,
    markcord.regexRules.bold,   
    markcord.regexRules.italic, 
    markcord.regexRules.spoiler,
    markcord.regexRules.emoji
]
markcord.types.all = [
    markcord.regexRules.codeblock,
    markcord.regexRules.pre,
    markcord.regexRules.header,
    markcord.regexRules.unorderedList,
    markcord.regexRules.quote,
    ...markcord.types.generic
]
markcord.types.spoiler = markcord.except(markcord.regexRules.spoiler, markcord.types.all)
markcord.types.italic = markcord.except(markcord.regexRules.italic, markcord.types.all)
markcord.types.bold = markcord.except(markcord.regexRules.bold, markcord.types.all)
markcord.types.bolditalic = markcord.except(markcord.regexRules.bolditalic, markcord.types.all)
markcord.types.strikethrough = markcord.except(markcord.regexRules.strikethrough, markcord.types.all)
markcord.types.underline = markcord.except(markcord.regexRules.underline, markcord.types.all)
markcord.types.header = [
    markcord.regexRules.codeblock,
    markcord.regexRules.pre,
    markcord.regexRules.unorderedList,
    markcord.regexRules.quote,
    ...markcord.types.generic
]
markcord.types.unorderedList = [
    markcord.regexRules.codeblock,
    markcord.regexRules.pre,
    markcord.regexRules.unorderedList,
    markcord.regexRules.quote,
    ...markcord.types.generic
]
markcord.types.quote = [
    markcord.regexRules.codeblock,
    markcord.regexRules.pre,
    markcord.regexRules.header,
    markcord.regexRules.unorderedList,
    ...markcord.types.generic
]
markcord.postprocessingRules = [
    markcord.regexRules.deescape,
    markcord.regexRules.declutterUnorderedLists,
    ["<<N>>", "\n"]
]
