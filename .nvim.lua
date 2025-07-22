-- [nfnl] .nvim.fnl
vim.filetype.add({pattern = {["layouts/.*.html"] = "gotmpl"}})
return vim.filetype.add({pattern = {["layouts/.*.xml"] = "gotmpl"}})
