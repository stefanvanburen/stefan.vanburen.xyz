-- [nfnl] .nvim.fnl
return vim.filetype.add({pattern = {["layouts/.*.html"] = "gotmpl", ["layouts/.*.xml"] = "gotmpl", ["assets/favicon-template.svg"] = "gotmpl"}})
