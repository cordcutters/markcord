# markcord
Simple, Discord-like regex markdown parser for the web, written in JavaScript

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

# Planning to add (maybe)
- Ordered lists
- Channel/User/Role/Slash Command mentions (`<#channel_id>`, `<@user_id>`, `<@&role_id>`, `</name:command_id>`)
- Codeblocks (\` or \`\`\` at both sides)

# Browser support
Most modern browsers should be able to support this parser, though it requires lookbehind assertions ([see browser support here](https://caniuse.com/js-regexp-lookbehind))

The default css file also uses the `:has` pseudoselector for determining if there are too much discord emojis ([see browser support here](https://caniuse.com/css-has))

# Using the library
If you want to play around with the library, you can do it with [Markcord Playground](https://cordcutters.github.io/markcord/), it will dynamically parse your markdown on input and shows you the source and how it looks like

To start out, include the markcord.js script and the style.css stylesheet in the head of your HTML:
```html
<script src="https://cordcutters.github.io/markcord/markcord.js">
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
- `markcord-spoiler`
- `markcord-revealed` (used for revealed spoilers alongside `markcord-spoiler`)

The default stylesheet can be found [here](https://github.com/cordcutters/markcord/blob/main/style.css)
