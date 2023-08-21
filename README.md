# markcord
Discord-like markdown parser for the web, written in JavaScript

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
