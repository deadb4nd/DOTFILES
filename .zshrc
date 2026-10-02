# ============================================
# EXPORTS & PATH
# ============================================
export ZSH="$HOME/.oh-my-zsh"
export PATH="$HOME/.nimble/bin:$HOME/bin:/usr/local/bin:$PATH"
export PATH=$PATH:~/.cargo/bin

# Android SDK
export ANDROID_HOME="$HOME/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
export ANDROID_AVD_HOME="$HOME/.config/.android/avd"

# Force X11 backend for Qt apps (Wayland workaround)
export QT_QPA_PLATFORM=xcb

# Terminal capability fixes
if [[ -n "$TMUX" ]]; then
    export TERM="tmux-256color"
fi
export COLORTERM="truecolor"

# Editor (fall back to vim if nvim isn't installed, and only alias vim->nvim if it exists)
if command -v nvim &>/dev/null; then
    export EDITOR='nvim'
    alias vim='nvim'
else
    export EDITOR='vim'
fi
export PATH="$PATH:$HOME/.platformio/penv/bin"

# Go binaries (only if go is actually installed)
if command -v go &>/dev/null; then
    export PATH=$PATH:$(go env GOPATH)/bin
fi

# ============================================
# OH-MY-ZSH CORE
# ============================================
ZSH_THEME=""

CASE_SENSITIVE="false"
HYPHEN_INSENSITIVE="true"
DISABLE_AUTO_UPDATE="false"
zstyle ':omz:update' mode auto
zstyle ':omz:update' frequency 7
ENABLE_CORRECTION="false"
COMPLETION_WAITING_DOTS="true"
DISABLE_UNTRACKED_FILES_DIRTY="true"
HIST_STAMPS="yyyy-mm-dd"
HISTSIZE=100000
SAVEHIST=100000

# History behavior
setopt EXTENDED_HISTORY
setopt HIST_EXPIRE_DUPS_FIRST
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
setopt SHARE_HISTORY
setopt AUTO_CD
setopt AUTO_PUSHD
setopt PUSHD_IGNORE_DUPS
setopt INTERACTIVE_COMMENTS
setopt PROMPT_SUBST

# ============================================
# PLUGINS
# ============================================
# Core plugins bundled with oh-my-zsh itself.
plugins=(
    git
    colored-man-pages
    command-not-found
    sudo
    history
    extract
    z
    fzf
)

# These three are NOT bundled with oh-my-zsh — they must be cloned into
# $ZSH_CUSTOM/plugins/<name>. Only enable them if they're actually present,
# otherwise oh-my-zsh throws a "plugin not found" error on every new shell.
_zsh_custom_dir="${ZSH_CUSTOM:-$ZSH/custom}"
for _optional_plugin in zsh-completions zsh-autosuggestions zsh-syntax-highlighting; do
    if [[ -d "$_zsh_custom_dir/plugins/$_optional_plugin" ]]; then
        plugins+=("$_optional_plugin")
    fi
done
unset _optional_plugin _zsh_custom_dir

source $ZSH/oh-my-zsh.sh

# ============================================
# HEARTH — cool slate scale, low-glare
# one main accent (periwinkle #7c9bd1) shared with Alacritty + tmux + nvim
# no pure black/white; every hue desaturated and inside a narrow
# 5.5:1-8:1 contrast band against the canvas
# ============================================
_h_bg0="#1a1c22"
_h_bg1="#20242c"
_h_bg2="#272c36"
_h_bg3="#333947"
_h_bg4="#232833"
_h_bg5="#2e3542"
_h_bg6="#5b6373"
_h_fg="#aeb5c1"
_h_fg_dim="#98a1af"
_h_red="#d1797c"
_h_green="#88b07c"
_h_green2="#9cbc8c"
_h_yellow="#cbae7b"
_h_blue="#7c9bd1"
_h_pink="#c98a99"
_h_aqua="#6ba89e"
_h_orange="#c29c77"
_h_gray="#98a1af"
_h_ash="#767e8c"
_h_violet="#9e93c8"
_h_gold="#7c9bd1"
_h_amber="#cbae7b"
_h_ember="#88b07c"
_h_fire="#d1797c"
_h_sun="#cbae7b"
_h_moss="#88b07c"
_h_lagoon="#6ba89e"
_h_slate="#c29c77"
_h_plum="#9e93c8"
_h_rose="#c98a99"
_h_comment="#767e8c"
_h_hover="#232833"
_h_raised="#272c36"
_h_sel="#313a4a"

# ============================================
# AUTOSUGGESTIONS
# ============================================
export ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=$_h_comment"
export ZSH_AUTOSUGGEST_STRATEGY=(history completion)
bindkey '^ ' autosuggest-accept

# ============================================
# VCS_INFO
# ============================================
autoload -Uz vcs_info
autoload -Uz add-zsh-hook
add-zsh-hook precmd vcs_info

zstyle ':vcs_info:*' enable git
zstyle ':vcs_info:git:*' check-for-changes true
zstyle ':vcs_info:git:*' stagedstr '+'
zstyle ':vcs_info:git:*' unstagedstr '!'
zstyle ':vcs_info:git:*' formats "%F{$_h_gold}%b%f%F{$_h_comment}%m%f%F{$_h_ember}%u%f%F{$_h_moss}%c%f"
zstyle ':vcs_info:git:*' actionformats "%F{$_h_gold}%b%f|%F{$_h_fire}%a%f%F{$_h_comment}%m%f%F{$_h_ember}%u%f%F{$_h_moss}%c%f"
zstyle ':vcs_info:git*+set-message:*' hooks git-untracked

+vi-git-untracked() {
    if [[ $(git rev-parse --is-inside-work-tree 2>/dev/null) == 'true' ]] && \
       git status --porcelain | grep -q '^??' 2>/dev/null; then
        hook_com[misc]='?'
    fi
}

# Build the git prompt segment as a plain variable (avoids nesting %F{...}
# inside ${var:+...}, which is what was producing the stray "}").
_build_git_segment() {
    if [[ -n "$vcs_info_msg_0_" ]]; then
        _git_segment=" %F{$_h_gold}${ICO_GIT}%f${vcs_info_msg_0_}"
    else
        _git_segment=""
    fi
}

add-zsh-hook precmd _build_git_segment

# ============================================
# MISSION — track your current pentest target
# mission HOST      lock a target (shows as a skull in the prompt)
# mission           clear it
# ============================================
_MISSION_FILE="${XDG_CACHE_HOME:-$HOME/.cache}/zsh_mission"

mission() {
    if [[ -z "$1" ]]; then
        rm -f "$_MISSION_FILE"
        print "mission terminated, target released"
    else
        echo "$1" > "$_MISSION_FILE"
        print "target locked: $1"
    fi
}

_precmd_mission() {
    if [[ -s "$_MISSION_FILE" ]]; then
        _mission_seg=" %F{$_h_sun}${ICO_TARGET}$(<"$_MISSION_FILE")%f"
    else
        _mission_seg=""
    fi
}
add-zsh-hook precmd _precmd_mission

# ============================================
# ICONS (colorless — applied in PROMPT/RPROMPT)
# ============================================
: "${ZSH_ICONS:=1}"

if [[ "$ZSH_ICONS" == "1" ]]; then
    ICO_SSH="󰣀 "
    ICO_DIR="󰉋 "
    ICO_GIT=" "
    ICO_OK="♥"
    ICO_FAIL="󰅙"
    ICO_ARROW="❯"
    ICO_VENV=" "
    ICO_JOBS="󰁫 "
    ICO_TARGET="☠ "
    ICO_HEART="♥"
else
    ICO_SSH="[ssh] "
    ICO_DIR=""
    ICO_GIT="git:"
    ICO_OK="♥"
    ICO_FAIL="x"
    ICO_ARROW=">"
    ICO_VENV="venv:"
    ICO_JOBS="jobs:"
    ICO_TARGET="[target] "
    ICO_HEART="♥"
fi

# ============================================
# PROMPT
# ============================================
if [[ -n "$SSH_CLIENT" || -n "$SSH_TTY" ]]; then
    _ssh_indicator="%F{$_h_fire}${ICO_SSH}%f"
else
    _ssh_indicator=""
fi

PROMPT='${_ssh_indicator}%F{$_h_fg_dim}%n@%m%f %F{$_h_fg}${ICO_DIR}%~%f${_mission_seg}${_git_segment} %(?.%F{$_h_moss}${ICO_OK}%f.%F{$_h_fire}${ICO_FAIL}%f) %F{$_h_gold}${ICO_ARROW}%f '

RPROMPT='%F{$_h_moss}${VIRTUAL_ENV:+${ICO_VENV}${VIRTUAL_ENV:t} }%f%(1j.%F{$_h_ember}${ICO_JOBS}%j%f .)%F{$_h_gold}${ICO_HEART}%f %F{$_h_comment}%D{%H:%M}%f'

# ============================================
# TOOLING
# ============================================
if command -v fzf &>/dev/null; then
    [ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
    export FZF_DEFAULT_OPTS="--height 40% --layout=reverse --border \
        --color=fg:$_h_fg,bg:$_h_raised,hl:$_h_gold \
        --color=fg+:$_h_fg,bg+:$_h_hover,hl+:$_h_amber \
        --color=info:$_h_moss,prompt:$_h_amber,pointer:$_h_fire \
        --color=marker:$_h_moss,spinner:$_h_lagoon,header:$_h_comment,gutter:$_h_raised"
    if command -v fd &>/dev/null; then
        export FZF_DEFAULT_COMMAND='fd --type f --hidden --exclude .git'
        export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
    fi
    # Preview panes — additive, keeps the hearth colors above intact.
    export FZF_CTRL_T_OPTS="--preview 'if [ -d {} ]; then eza -lah --group-directories-first --icons {} 2>/dev/null; else bat --color=always --style=numbers --line-range=:80 {} 2>/dev/null; fi'"
    export FZF_ALT_C_OPTS="--preview 'eza -lah --group-directories-first --icons {} 2>/dev/null'"
    export FZF_CTRL_R_OPTS="--preview 'echo {}' --preview-window hidden:wrap"

    # ── KEY REROUTE ────────────────────────────────────────────────────
    # fzf's own key-bindings put ^T (files) and Alt-C (cd) on the widgets;
    # this session prefers ^F / Alt-F (the widget env var names stay
    # FZF_CTRL_T_* / FZF_ALT_C_* because the widgets read those by name).
    for _km in emacs viins vicmd; do
        bindkey -M "$_km" -r '^T' 2>/dev/null
        bindkey -M "$_km" -r '\ec' 2>/dev/null
        bindkey -M "$_km" '^F' fzf-file-widget
        bindkey -M "$_km" '\ef' fzf-cd-widget
    done
    unset _km

    # ── CHEATSHEET ───────────────────────────────────────────────────
    # Alt-H → hearth cheatsheet in less (also bound in tmux :prefix ?)
    zle -N _show_cheatsheet
    _show_cheatsheet() {
        zle -K main
        less -R -X "$HOME/.config/hearth-cheatsheet"
        zle reset-prompt
    }
    for _km in emacs viins; do
        bindkey -M "$_km" '\eh' _show_cheatsheet
    done
    unset _km
fi

if command -v zoxide &>/dev/null; then
    eval "$(zoxide init zsh --cmd cd)"
fi

if command -v eza &>/dev/null; then
    alias l='eza -lah --group-directories-first --icons --git'
    alias ll='eza -lh --group-directories-first --icons --git'
    alias lt='eza -lah --sort=modified --group-directories-first --icons --git'
    alias lS='eza -lah --sort=size --group-directories-first --icons --git'
    alias tree='eza --tree --level=2 --icons --git'
else
    alias l='ls -lah --group-directories-first'
    alias ll='ls -lh --group-directories-first'
    alias lt='ls -lahrt --group-directories-first'
    alias lS='ls -lahS --group-directories-first'
fi

if command -v batcat &>/dev/null; then
    alias cat='batcat --paging=never --theme=gruvbox-dark --style=plain'
elif command -v bat &>/dev/null; then
    alias cat='bat --paging=never --theme=gruvbox-dark --style=plain'
fi

# ============================================
# ALIASES
# ============================================
alias velo="cd /home/itz_4ura/Documents/PlatformIO/Projects/velo_box && vim ."

alias ..='cd ..'
alias ...='cd ../..'
alias mkdir='mkdir -pv'

alias cp='cp -iv'
alias mv='mv -iv'
alias rm='rm -Iv'
alias ln='ln -iv'

alias ports='ss -tulanp'
alias portsl='lsof -i -P -n'
alias myip='curl -s https://ipinfo.io/ip'
alias digx='dig +short'
alias headers='curl -I -s -L'

alias psg='ps aux | grep -v grep | grep -i'
alias mem='ps aux --sort=-%mem | head -20'
alias cpu='ps aux --sort=-%cpu | head -20'

alias zshrc='$EDITOR ~/.zshrc'
alias reload='source ~/.zshrc'
alias c="clear"

# Git — these intentionally override the oh-my-zsh git plugin's defaults
# (e.g. its gl='git pull') since they're sourced after the plugin.
alias gs='git status -sb'
alias ga='git add'
alias gc='git commit -v'
alias gp='git push'
alias gl='git log --oneline --graph --decorate -20'
alias gd='git diff'
alias gds='git diff --staged'

alias bbemu='VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/intel_icd.x86_64.json emulator -avd bugbounty -writable-system -snapshot bugbounty_burp -no-snapshot-save -skin 720x1280'
alias bbemu-headless='emulator -avd bugbounty -writable-system -snapshot bugbounty_clean -no-snapshot-save -gpu swiftshader_indirect -no-window -no-boot-anim & sleep 15 && scrcpy -s emulator-5554'

# ============================================
# PENTEST KIT — the hunt, streamlined.
# Only loaded for tools you actually own.
# ============================================
if command -v nmap &>/dev/null; then
    alias scan-quick='nmap -T4 -F -Pn --open'           # fast sweep, common ports
    alias scan-top='nmap -T4 --top-ports 100 -Pn -sV'   # services on the usual
    alias scan-all='nmap -T4 -p- -Pn -sV'               # every single port
    alias scan-ping='nmap -sn'                          # host discovery
fi

if command -v nc &>/dev/null; then
    listen() { nc -lvnp "${1:-4444}"; }                 # reverse-shell catcher
fi

if command -v openssl &>/dev/null; then
    cert() { echo | openssl s_client -connect "${1:?usage: cert HOST [PORT]}":${2:-443} 2>/dev/null | openssl x509 -noout -text 2>/dev/null; }
fi

alias ns='ss -tulpn'
alias ipa='ip -br -c a'
alias myroutes='ip route'

b64e() { printf '%s' "$1" | base64; }
b64d() { printf '%s' "$1" | base64 -d; printf '\n'; }
urlenc() { python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))' "$1"; }
urldec() { python3 -c 'import urllib.parse,sys; print(urllib.parse.unquote(sys.argv[1]))' "$1"; }
mkhash() { printf '%s' "$1" | sha256sum | cut -d' ' -f1; }
lhost() { ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}'; }

# ============================================
# MOTIVATION — a mantra a day keeps the grind alive
# ============================================
_mantras=(
    "recon first. privilege escalation is a conversation."
    "you don't find the bug, you earn it."
    "enumerate everything twice, trust nothing once."
    "read the docs, then read /usr/share/doc."
    "one shell at a time, one flag at a time."
    "the answer is in the response headers."
    "slow is smooth, smooth is fast. measure twice, pwn once."
    "the box isn't hardened, you're just not looking hard enough."
)
_random_mantra() { print -n "$_mantras[$((RANDOM % ${#_mantras} + 1))]"; }

motivate() {
    print -P "%F{$_h_sun}${ICO_TARGET}%f%F{$_h_fg_dim}$(_random_mantra)%f"
}

if [[ "$ZSH_MANTRA" != "0" ]]; then
    _mantra_file="${XDG_CACHE_HOME:-$HOME/.cache}/zsh_mantra"
    _mantra_today="$(date +%F)"
    if [[ -f "$_mantra_file" && "$(<"$_mantra_file")" == "$_mantra_today" ]]; then
        : # already said it today
    else
        echo "$_mantra_today" > "$_mantra_file"
        print -P ""
        print -P "%F{$_h_fire}♥%f  %F{$_h_gold}▰▰▰▰  HEARTH  ▰▰▰▰%f  %F{$_h_fire}♥%f  %F{$_h_comment}%m · %D{%A %d %b}%f"
        print -P "%F{$_h_comment}  ─────────────────────────────────────%f"
        if command -v fastfetch &>/dev/null && [[ "$ZSH_FASTFETCH" != "0" ]]; then
            fastfetch
            print -P ""
        fi
        print -P "%F{$_h_ember}${ICO_TARGET}%f %F{$_h_fg_dim}$(_random_mantra)%f"
        print -P ""
    fi
    unset _mantra_file _mantra_today
fi

# ============================================
# FUNCTIONS
# ============================================
mkcd() { mkdir -p "$1" && cd "$1"; }

xtract() {
    if [ -f "$1" ]; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"   ;;
            *.tar.gz)    tar xzf "$1"   ;;
            *.tar.xz)    tar xf "$1"    ;;
            *.bz2)       bunzip2 "$1"   ;;
            *.rar)       unrar x "$1"   ;;
            *.gz)        gunzip "$1"    ;;
            *.tar)       tar xf "$1"    ;;
            *.tbz2)      tar xjf "$1"   ;;
            *.tgz)       tar xzf "$1"   ;;
            *.zip)       unzip "$1"     ;;
            *.xz)        unxz "$1"      ;;
            *.Z)         uncompress "$1";;
            *.7z)        7z x "$1"      ;;
            *.deb)       dpkg-deb -x "$1" . ;;
            *)           echo "Unknown: '$1'" ;;
        esac
    else
        echo "Not a file: '$1'"
    fi
}

hex() { xxd "$1" | head -20; }
serve() { python3 -m http.server "${1:-8080}"; }
ff() { find . -type f -iname "*${1}*" 2>/dev/null; }
fstr() { grep -rIin "$1" . 2>/dev/null | head -30; }
weather() { curl -s "wttr.in/${1:-}"; }
gcom() { git add -A && git commit -m "$1"; }
backup() { cp -v "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)"; }

venv() {
    local name="${1:-.venv}"
    [ -d "$name" ] || python3 -m venv "$name"
    source "$name/bin/activate"
}

hr() {
    local cols=$(tput cols)
    printf "%b" "\033[38;2;98;88;66m"
    printf '%*s\n' "$cols" '' | tr ' ' '─'
    printf "%b" "\033[0m"
}

pioreset() {
  local env="${1:-$(basename $(pwd))}"
  rm -rf ".pio/build/$env"
  pio run -e "$env" && pio run -e "$env" -t compiledb
}

# ============================================
# COMPLETION STYLING
# ============================================
zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}' 'r:|[._-]=* r:|=*' 'l:|=* r:|=*'
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"
zstyle ':completion:*' rehash true
zstyle ':completion:*' group-name ''
zstyle ':completion:*:descriptions' format "%F{$_h_gold}-- %d --%f"
zstyle ':completion:*:warnings' format "%F{$_h_fire}-- no matches --%f"

# ============================================
# KEYBINDINGS
# ============================================
bindkey '^[[A' up-line-or-search
bindkey '^[[B' down-line-or-search
bindkey '^[[H' beginning-of-line
bindkey '^[[F' end-of-line
bindkey '^[[3~' delete-char
# Word-jump on xterm/kitty-style sequences (additive; hearth untouched)
bindkey '^[[1;5C' forward-word   # Ctrl+Right
bindkey '^[[1;5D' backward-word  # Ctrl+Left
bindkey '^[[1;3C' forward-word   # Alt+Right
bindkey '^[[1;3D' backward-word  # Alt+Left
bindkey '^[[C'    forward-char
bindkey '^[[D'    backward-char
bindkey '^W'      backward-kill-word
bindkey '^[[3;5~' kill-word      # Ctrl+Del
bindkey '^H'      backward-delete-char
bindkey '^[[Z'    reverse-menu-complete
# NOTE: ^R is handled by fzf (sourced in TOOLING section)

[ -f ~/.zshrc.local ] && source ~/.zshrc.local
export PATH="/home/itz_4ura/.local/bin:$PATH"


# opam (OCaml package manager)
[[ ! -r '/home/itz_4ura/.opam/opam-init/init.zsh' ]] || source '/home/itz_4ura/.opam/opam-init/init.zsh' > /dev/null 2> /dev/null
