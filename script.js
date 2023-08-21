const input = document.getElementById("input")
const output = document.getElementById("output")
const source = document.getElementById("source")

function parser() {
    const parsed = markcord.parse(input.value)
    output.innerHTML = parsed
    source.textContent = parsed
    hljs.highlightAll();
}
input.addEventListener("input", parser)
parser();