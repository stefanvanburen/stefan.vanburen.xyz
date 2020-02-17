+++
title = "`extract` in fish"
description = ""
tags = ["development", "fish", "shell"]
date = 2019-11-14T10:40:55-05:00
draft = false
+++
I recently switched from `zsh` to `fish` as my shell of choice.
I liked the idea of starting from scratch, with the sane defaults that `fish` provides, as my [`zsh` configuration files were getting a bit out of control](https://github.com/svanburen/dotfiles/blob/master/zshrc).

For the most part, the transition was fairly painless and straightforward.
However, I still miss a few of the `zsh` niceties that I had been used to over the years - one being [`extract` function provided in oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh/blob/master/plugins/extract/extract.plugin.zsh).
Even after moving away from oh-my-zsh as my plugin manager in `zsh`, I had used my new manager to grab [just that plugin](https://github.com/svanburen/dotfiles/blob/74dd7a02b83ca1874d721e242e0f466ca1f65692/zshrc#L13-L14) for my usage.

After a cursory google, it seemed like a `fish` port of the plugin didn't exist, so I decided to try to port over the plugin myself.
You can find the whole function [here](https://github.com/svanburen/dotfiles/blob/9e62163c674f3fef58a12d752daa78b4c5eeecbe/config.fish#L65-L125).

First, we'll define a function named `extract` and give it a description.
I've also noted in a comment where this function was ported from.
```fish
function extract -d "extract files from archives"
    # largely adapted from https://github.com/robbyrussell/oh-my-zsh/blob/master/plugins/extract/extract.plugin.zsh
```

The function first checks if we have arguments - if we have none, there's nothing to do, so we'll echo a usage string to stderr and exit.
```fish
    # no arguments, write usage
    if test (count $argv) -eq 0
        echo "Usage: extract [-option] [file ...]\n Options:\n -r, --remove    Remove archive after unpacking." >&2
        exit 1
    end
```

Next, we check to see if the `-r` / `--remove` option has been supplied as the first argument.
If it is, we'll remove the archive files after they've been successfully unarchived.
We also remove this argument so that our main loop can iterate correctly over the filenames.
```fish
    set remove_file 0
    if test $argv[1] = "-r"; or test $argv[1] = "--remove"
        set remove_file 1
        set --erase argv[1]
    end
```

Now comes the main loop, which iterates over the filenames supplied.
```fish
    for i in $argv[1..-1]
```

First, we ensure that the filename arguments are valid files:
```fish
        if test ! -f $i
            echo "extract: '$i' is not a valid file" >&2
            continue
        end
```

We default our success value to `0` - if the file's extension isn't something we can deal with, we'll set this to `1` so that we can avoid removing the file even if the remove option is set.
Then, we grab the extension via some fish regex matching, using the `string match` function.
```fish
        set success 0
        set extension (string match -r ".*(\.[^\.]*)\$" $i)[2]
```

Now, we've reached the main switch statement, which is largely a translation of the `zsh` version's unarchiving calls to `fish`.
```fish
        switch $extension
            case '*.tar.gz' '*.tgz'
                tar xv; or tar zxvf "$i"
            case '*.tar.bz2' '*.tbz' '*.tbz2'
                tar xvjf "$i"
            case '*.tar.xz' '*.txz'
                tar --xz -xvf "$i"; or xzcat "$i" | tar xvf -
            case '*.tar.zma' '*.tlz'
                tar --lzma -xvf "$i"; or lzcat "$i" | tar xvf -
            case '*.tar'
                tar xvf "$i"
            case '*.gz'
                gunzip -k "$i"
            case '*.bz2'
                bunzip2 "$i"
            case '*.xz'
                unxz "$i"
            case '*.lzma'
                unlzma "$i"
            case '*.z'
                uncompress "$i"
            case '*.zip' '*.war' '*.jar' '*.sublime-package' '*.ipsw' '*.xpi' '*.apk' '*.aar' '*.whl'
                set extract_dir (string match -r "(.*)\.[^\.]*\$" $i)[2]
                unzip "$i" -d $extract_dir
            case '*.rar'
                unrar x -ad "$i"
            case '*.7z'
                7za x "$i"
            case '*'
                echo "extract: '$i' cannot be extracted" >&2
                set success 1
        end
```

Finally, we'll remove the original file if we've successfully unarchived the file, and end the loop and the function.
```fish
        if test $success -eq 0; and test $remove_file -eq 1
            rm $i
        end
    end
end
```

This was my first experience trying to port a larger function from `zsh` to `fish`, and it definitely took some playing around with the various test functions to get it right.
Also, the `string match` functions were largely cobbled together from StackOverflow.
I strongly suggest [aliasing this function to `x`](https://github.com/svanburen/dotfiles/blob/9e62163c674f3fef58a12d752daa78b4c5eeecbe/config.fish#L21), or some other short sequence, for easier usage.

And voilà, we have a working general purpose extraction function, in `fish`!

🐠
