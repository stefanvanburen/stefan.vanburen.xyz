+++
title = "rams.vim"
date = 2020-09-15T16:38:18-04:00
draft = false
+++
I published the vim colorscheme I've been using for the last few months [publicly on GitHub](https://github.com/svanburen/rams.vim).
It's called rams.vim, after the famous German Designer, [Dieter Rams](https://en.wikipedia.org/wiki/Dieter_Rams).

I had the idea for the colorscheme after watching [Gary Hustwit's](https://en.wikipedia.org/wiki/Gary_Hustwit) [_Rams_](https://en.wikipedia.org/wiki/Rams_(2018_film)).
It's simple: off-black, off-white, a grey and an accent color (a medium-bright red).
I also added a green and red that are specifically for showing diffs in vim.

The colorscheme is generated via [vim-colortemplate](https://github.com/lifepillar/vim-colortemplate), which aided the creation greatly - I have no previous experience with vim colorscheme creation, and based on the other colorschemes I surveyed, it seemed like one of the few sane ways to get an idea up and running quickly.

I'm quite happy with the colorscheme as is - I've been using the light colors for a couple months now.
The dark mode could use some work, but I'm not using it regularly, so I've been mostly keeping it in sync with the light variant.
I've also added some plugin-specific highlights for the obvious candidates ([ALE](https://github.com/dense-analysis/ale), [fugitive](https://github.com/tpope/vim-fugitive) / [gitgutter](https://github.com/airblade/vim-gitgutter)), but haven't explored all of the plugins I kept around after my [dotfile purge](/blog/spring-cleaning).

If you're a vim user, give it a try, and let me know what you think!
