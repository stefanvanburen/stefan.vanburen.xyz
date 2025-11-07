;; layouts are Go HTML templates
(vim.filetype.add {:pattern {:layouts/.*.html :gotmpl
                             :layouts/.*.xml :gotmpl
                             :assets/favicon-template.svg :gotmpl}})
