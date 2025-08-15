;; layouts are Go HTML templates
(vim.filetype.add {:pattern {:layouts/.*.html :gotmpl}})
(vim.filetype.add {:pattern {:layouts/.*.xml :gotmpl}})
(vim.filetype.add {:pattern {:assets/favicon-template.svg :gotmpl}})
