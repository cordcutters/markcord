# markcord
Simple, Discord-like regex markdown parser for the web, written in JavaScript
# IMPORTANT
currently pretty broken, you can find a working version in the v1 branch

# Supported features
- Headers (`#` at the start)
- Quotes (`>` at the start)
- Unordered list items (`-` or `*` at the start)
- Underline text (`__` at both sides)
- Strikethrough text (`~~` at both sides)
- Italic text (`*` or `_` at both sides)
- Discord emojis (`<:name:id>` or `<a:name:id>`)
- Masked URLs (`[mask](url)`)
- URLs (`https://any_valid_url` or `http://any_valid_url`)
- Spoilers (`||` at both sides)
- Codeblocks (\` or \`\`\` at both sides)
- Codeblocks have highlight.js support

# Planning to add (maybe)
- Ordered lists
- Channel/User/Role/Slash Command mentions (`<#channel_id>`, `<@user_id>`, `<@&role_id>`, `</name:command_id>`)

# Browser support
Most modern browsers should be able to support this parser, though it requires lookbehind assertions ([see browser support here](https://caniuse.com/js-regexp-lookbehind))

The default css file also uses the `:has` pseudoselector for determining if there are too much discord emojis ([see browser support here](https://caniuse.com/css-has))

Some elements (such as emojis, spoilers or URLs) may function incorrectly if JavaScript is disabled.

# Using the library
If you want to play around with the library, you can do it with [Markcord Playground](https://cordcutters.github.io/markcord/), it will dynamically parse your markdown on input and shows you the source and how it looks like

To start out, include the markcord.js script and the style.css stylesheet in the head of your HTML:
```html
<script src="https://cordcutters.github.io/markcord/markcord.js"></script>
<link href="https://cordcutters.github.io/markcord/style.css" rel="stylesheet" type="text/css" />
```
To parse some content, you can use the `markcord.parse` function:
```javascript
markcord.parse("# Markdown goes here!") // => `<h2 class="markcord-header">
//                                               Markdown goes here!
//                                             </h2>`
```
Markcord also automatically HTML-encodes dangerous characters like <, > and others.

If you just want Markcord to clean your content, you can use the `markcord.clean` function:
```javascript
markcord.clean("<script>alert('Unsafe input!')</script>") // => "&lt;script&gt;alert('Unsafe input!')&lt;/script&gt;"
```

## Configuring the library
### Styling elements yourself
Markcord adds a special class to each element to make it easier to style them.

Class names markcord uses:
- `markcord-header`
- `markcord-ul`
- `markcord-li`
- `markcord-quote`
- `markcord-underline`
- `markcord-strikethrough`
- `markcord-bold`
- `markcord-italic`
- `markcord-emoji`
- `markcord-big` (used for big emojis alongside `markcord-emoji`)
- `markcord-url`
- `markcord-masked` (used for masked URLs alongside `markcord-url`)
- `markcord-noembed` (used for URLs/masked URLs that have embeds disabled alongside `markcord-url`)
- `markcord-spoiler`
- `markcord-revealed` (used for revealed spoilers alongside `markcord-spoiler`)
- `markcord-pre`
- `markcord-code`

The default stylesheet can be found [here](https://github.com/cordcutters/markcord/blob/v2/style.css)
### Overriding event behaviour
By default, the library sets some events for elements such as emojis, spoiler or URLs to implement certain behaviours.

You can override those functions:
```javascript
markcord.emoteError = function (self) {
  self.replaceWith(document.createTextNode(`:${self.attributes.name.value}:`));
  // This function gets called if an error with the image element occurs.
  // Most likely, this gets caused by the image failing to load (invalid emoji id provided)
  // The default function replaces it with :name:
};

markcord.interceptLink = function (self, event) {
  // This function is called when a link or a masked link is clicked.
  // By default, this function does not do anything.
}

markcord.revealSpoiler = function (self) {
  if (!self.className.includes("markcord-revealed")) {
    self.className += " markcord-revealed";
  };
  // This function is called when a spoiler is clicked.
  // By default, it adds the markcord-revealed class to the element if it does not have it.
}
```

### Using parsed content in other places
If you want to use the parsed content without including the Markcord script, some elements will break:

spoilers will not work without the script, emojis will not get replaced in case of an error while loading the image, link clicks will not be intercepted.

If you want to retain this functionality, you can make markcord as an object:
```javascript
const markcord = {};
```
and add the code from the above section to include the event handler functions.


Using the parsed content without the stylesheet will likely render elements in a wrong way,

if you do not wish to include the Markcord stylesheet, you could include the code from it in your own stylesheet.

### Miscellaneous options
- `markcord.cdn`: The CDN to load discord emojis from, defaults to `https://cdn.discordapp.com`
- `markcord.headerOffset`: Offset for header numbers, defaults to `1` (the bigger this value, the smaller the headers)
- `markcord.cleaner`: The HTML element used for cleaning text. You should not change this value unless you know what you are doing.
