-- [nfnl] .nvim.fnl
vim.filetype.add({pattern = {["layouts/.*.html"] = "gotmpl"}})
vim.filetype.add({pattern = {["layouts/.*.xml"] = "gotmpl"}})
return vim.filetype.add({pattern = {["assets/favicon-template.svg"] = "gotmpl"}})
