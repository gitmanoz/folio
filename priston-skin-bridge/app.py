import os
import sys
import json
import shutil
import hashlib
from pathlib import Path
from datetime import datetime
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

APP_NAME = "Priston Skin Bridge"
APP_VERSION = "0.1"
TARGET_EXTS = {".smd", ".tga", ".bmp", ".png"}
PT_NAMES = {"zzpttool.exe", "zzpttools.exe", "pristontool.exe", "pristontools.exe"}


def norm(p):
    try:
        return str(Path(p).resolve())
    except Exception:
        return str(Path(p))


def is_game_root(p: Path):
    if not p.exists() or not p.is_dir():
        return False
    drop = p / "image" / "Sinimage" / "Items" / "DropItem"
    exe_ok = (p / "game.exe").exists() or (p / "PsTale.exe").exists()
    return exe_ok and drop.exists()


def is_pttools_root(p: Path):
    if not p.exists() or not p.is_dir():
        return False
    try:
        names = {x.name.lower() for x in p.iterdir() if x.is_file()}
        return bool(names & PT_NAMES)
    except Exception:
        return False


def limited_walk(root: Path, max_depth=5):
    root = root.resolve()
    skip = {"windows", "$recycle.bin", "system volume information", "node_modules", ".git", "appdata"}
    for cur, dirs, files in os.walk(root):
        curp = Path(cur)
        try:
            depth = len(curp.relative_to(root).parts)
        except Exception:
            depth = 99
        dirs[:] = [d for d in dirs if d.lower() not in skip and not d.startswith(".")]
        if depth >= max_depth:
            dirs[:] = []
        yield curp, files


def find_pttools():
    out = []
    home = Path.home()
    roots = [
        home / "Desktop", home / "Downloads", home / "Documents",
        Path(r"C:\zzPTtool"), Path(r"C:\zzPTTOOLS"),
        Path(r"C:\Program Files"), Path(r"C:\Program Files (x86)"),
    ]
    seen = set()
    for root in roots:
        if not root.exists():
            continue
        if is_pttools_root(root):
            s = norm(root)
            if s not in seen:
                out.append(s); seen.add(s)
        if root in [home / "Desktop", home / "Downloads", home / "Documents"]:
            for cur, files in limited_walk(root, 4):
                low = {f.lower() for f in files}
                if low & PT_NAMES:
                    s = norm(cur)
                    if s not in seen:
                        out.append(s); seen.add(s)
    return out


def find_game_roots():
    out = []
    candidates = [
        Path.cwd(),
        Path(sys.executable).parent if getattr(sys, "frozen", False) else Path.cwd(),
        Path(r"C:\Zenit Games\Priston Tale Brasil Reloaded (Beta)"),
        Path(r"C:\Zenit Games\Priston Tale Brasil Reloaded"),
        Path(r"C:\Zenit Games\Priston Tale Brasil"),
        Path(r"C:\Priston Tale"),
    ]
    home = Path.home()
    candidates += [home / "Desktop", home / "Documents", home / "Downloads"]
    seen = set()
    for c in candidates:
        if is_game_root(c):
            s = norm(c)
            if s not in seen:
                out.append(s); seen.add(s)
        elif c.exists() and c in [home / "Desktop", home / "Documents", home / "Downloads"]:
            for cur, files in limited_walk(c, 4):
                if ("game.exe" in {f.lower() for f in files} or "pstale.exe" in {f.lower() for f in files}) and is_game_root(cur):
                    s = norm(cur)
                    if s not in seen:
                        out.append(s); seen.add(s)
    return out


def scan_pttools_assets(ptroot: Path):
    rows = []
    keywords = ("drop", "flag", "shel", "item", "loot", "skin")
    for cur, dirs, files in os.walk(ptroot):
        dirs[:] = [d for d in dirs if d.lower() not in {"backup", "backups", ".git"}]
        cur_low = str(cur).lower()
        for f in files:
            p = Path(cur) / f
            if p.suffix.lower() not in TARGET_EXTS:
                continue
            score = 0
            low = str(p).lower()
            if any(k in low for k in keywords): score += 3
            if f.lower().startswith("itos"): score += 4
            if f.lower().startswith("itpm"): score += 4
            if "coin" in f.lower() or "gold" in f.lower(): score += 2
            if score:
                rows.append((score, p))
    rows.sort(key=lambda x: (-x[0], str(x[1]).lower()))
    return rows


def analyze_game(game: Path):
    drop = game / "image" / "Sinimage" / "Items" / "DropItem"
    files = {p.name.lower(): p for p in drop.iterdir() if p.is_file()}
    sheltom_smd = sorted([n for n in files if n.startswith("itos") and n.endswith(".smd")])
    magical_drop = [f"itos{i}.smd" for i in range(121, 135) if f"itos{i}.smd" in files]
    mana_smd = sorted([n for n in files if n.startswith("itpm") and n.endswith(".smd")])
    gold_like = sorted([n for n in files if ("coin" in n or "gold" in n or n.startswith("itgg")) and n.endswith((".smd", ".tga", ".bmp"))])
    return {
        "drop_dir": str(drop),
        "sheltom_smd": sheltom_smd,
        "magical_distinct_smd": magical_drop,
        "mana_smd": mana_smd,
        "gold_like": gold_like,
    }


def make_backup(game: Path, targets):
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    root = game / "PristonSkinBridge_Backup" / stamp
    drop = game / "image" / "Sinimage" / "Items" / "DropItem"
    copied = []
    for name in targets:
        src = drop / name
        if src.exists():
            dst = root / "DropItem" / name
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            copied.append(name)
    manifest = {"created": stamp, "game": str(game), "files": copied}
    root.mkdir(parents=True, exist_ok=True)
    (root / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    return root


def latest_backup(game: Path):
    root = game / "PristonSkinBridge_Backup"
    if not root.exists(): return None
    subs = sorted([p for p in root.iterdir() if p.is_dir()], reverse=True)
    return subs[0] if subs else None


def sha256(p: Path):
    h = hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda: f.read(1024 * 1024), b""):
            h.update(b)
    return h.hexdigest()


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(f"{APP_NAME} v{APP_VERSION}")
        self.geometry("930x700")
        self.minsize(820, 620)
        self.pt_var = tk.StringVar()
        self.game_var = tk.StringVar()
        self.source_var = tk.StringVar()
        self.asset_rows = []
        self._build()
        self.after(200, self.auto_detect)

    def _build(self):
        pad = {"padx": 8, "pady": 6}
        top = ttk.Frame(self); top.pack(fill="x", **pad)
        ttk.Label(top, text="Priston Tools:").grid(row=0, column=0, sticky="w")
        ttk.Entry(top, textvariable=self.pt_var, width=82).grid(row=0, column=1, sticky="ew")
        ttk.Button(top, text="Procurar", command=self.pick_pt).grid(row=0, column=2)
        ttk.Label(top, text="Pasta do jogo:").grid(row=1, column=0, sticky="w")
        ttk.Entry(top, textvariable=self.game_var, width=82).grid(row=1, column=1, sticky="ew")
        ttk.Button(top, text="Procurar", command=self.pick_game).grid(row=1, column=2)
        top.columnconfigure(1, weight=1)

        btns = ttk.Frame(self); btns.pack(fill="x", **pad)
        ttk.Button(btns, text="Analisar", command=self.analyze).pack(side="left", padx=4)
        ttk.Button(btns, text="Aplicar pasta de skins selecionada", command=self.apply_selected_folder).pack(side="left", padx=4)
        ttk.Button(btns, text="Restaurar último backup", command=self.restore).pack(side="left", padx=4)
        ttk.Button(btns, text="Salvar relatório", command=self.save_report).pack(side="left", padx=4)

        ttk.Label(self, text="Pastas/arquivos de skin encontrados dentro do Priston Tools:").pack(anchor="w", padx=12)
        mid = ttk.Frame(self); mid.pack(fill="both", expand=False, padx=10, pady=4)
        self.tree = ttk.Treeview(mid, columns=("score", "path"), show="headings", height=10)
        self.tree.heading("score", text="Score"); self.tree.column("score", width=60, anchor="center")
        self.tree.heading("path", text="Arquivo"); self.tree.column("path", width=790)
        self.tree.pack(side="left", fill="both", expand=True)
        sb = ttk.Scrollbar(mid, orient="vertical", command=self.tree.yview); sb.pack(side="right", fill="y")
        self.tree.configure(yscrollcommand=sb.set)
        self.tree.bind("<<TreeviewSelect>>", self.on_select)

        ttk.Label(self, text="Diagnóstico / log:").pack(anchor="w", padx=12, pady=(8,0))
        self.log = tk.Text(self, wrap="word", height=18)
        self.log.pack(fill="both", expand=True, padx=10, pady=6)
        self.log.insert("end", "O programa só copia arquivos visuais e sempre cria backup antes de substituir.\n")

    def write(self, s=""):
        self.log.insert("end", s + "\n"); self.log.see("end"); self.update_idletasks()

    def auto_detect(self):
        self.write("Procurando Priston Tools e Priston...")
        pts = find_pttools(); games = find_game_roots()
        if pts:
            self.pt_var.set(pts[0]); self.write(f"Priston Tools encontrado: {pts[0]}")
        else:
            self.write("zzPTtool.exe não foi encontrado automaticamente. Use Procurar.")
        if games:
            self.game_var.set(games[0]); self.write(f"Priston encontrado: {games[0]}")
        else:
            self.write("Pasta do Priston não encontrada automaticamente. Use Procurar.")
        if pts and games: self.analyze()

    def pick_pt(self):
        p = filedialog.askdirectory(title="Selecione a pasta que contém zzPTtool.exe")
        if p: self.pt_var.set(p); self.analyze()

    def pick_game(self):
        p = filedialog.askdirectory(title="Selecione a pasta raiz do Priston (onde ficam game.exe/PsTale.exe)")
        if p: self.game_var.set(p); self.analyze()

    def analyze(self):
        self.tree.delete(*self.tree.get_children())
        self.asset_rows = []
        pt = Path(self.pt_var.get())
        game = Path(self.game_var.get())
        if not is_pttools_root(pt):
            self.write("[ERRO] Pasta do Priston Tools inválida: não encontrei zzPTtool.exe.")
            return
        if not is_game_root(game):
            self.write("[ERRO] Pasta do jogo inválida: preciso encontrar game.exe/PsTale.exe e image\\Sinimage\\Items\\DropItem.")
            return
        self.write("\n=== ANÁLISE ===")
        info = analyze_game(game)
        self.write(f"DropItem: {info['drop_dir']}")
        self.write(f"Sheltoms no chão: {', '.join(info['sheltom_smd']) or 'nenhum'}")
        self.write(f"SMDs distintos 121-134 (candidatos a mágicos): {', '.join(info['magical_distinct_smd']) or 'NENHUM'}")
        self.write(f"Modelos de mana: {', '.join(info['mana_smd']) or 'nenhum'}")
        self.write(f"Arquivos parecidos com ouro/moeda: {', '.join(info['gold_like']) or 'nenhum identificado pelo nome'}")
        if not info['magical_distinct_smd']:
            self.write("[ATENÇÃO] Não há SMD 121-134 em DropItem. Isso indica que os Sheltoms Mágicos reutilizam modelos de chão dos normais; uma skin estática nesses modelos destacaria os dois.")
        if len(info['mana_smd']) <= 1:
            self.write("[ATENÇÃO] Há um único modelo itPM*.smd. Se todas as manas usam esse modelo, skin estática não separa Mana Suprema das demais.")
        self.write("[ATENÇÃO] Ouro > 1000 não pode ser separado por skin se todos os valores usam o mesmo modelo de moeda; skin não conhece o valor numérico do drop.")

        rows = scan_pttools_assets(pt)
        self.asset_rows = rows
        for idx, (score, p) in enumerate(rows[:800]):
            self.tree.insert("", "end", iid=str(idx), values=(score, str(p)))
        self.write(f"Arquivos visuais candidatos encontrados no Priston Tools: {len(rows)}")
        self.write("Selecione um arquivo da lista; o botão Aplicar usa a pasta dele como fonte e copia somente basenames que já existem em DropItem.")

    def on_select(self, _evt=None):
        sel = self.tree.selection()
        if not sel: return
        idx = int(sel[0])
        if idx < len(self.asset_rows):
            self.source_var.set(str(self.asset_rows[idx][1].parent))
            self.write(f"Fonte selecionada: {self.source_var.get()}")

    def apply_selected_folder(self):
        game = Path(self.game_var.get())
        srcdir = Path(self.source_var.get())
        if not is_game_root(game): return messagebox.showerror(APP_NAME, "Pasta do jogo inválida.")
        if not srcdir.exists(): return messagebox.showerror(APP_NAME, "Selecione primeiro um arquivo/pasta de skin do Priston Tools.")
        drop = game / "image" / "Sinimage" / "Items" / "DropItem"
        dst_names = {p.name.lower(): p.name for p in drop.iterdir() if p.is_file()}
        candidates = []
        for p in srcdir.rglob("*"):
            if p.is_file() and p.suffix.lower() in TARGET_EXTS and p.name.lower() in dst_names:
                candidates.append((p, drop / dst_names[p.name.lower()]))
        if not candidates:
            return messagebox.showwarning(APP_NAME, "Nenhum arquivo dessa pasta possui basename correspondente em DropItem.")
        preview = "\n".join(f"• {a.name}" for a,_ in candidates[:25])
        if len(candidates) > 25: preview += f"\n... +{len(candidates)-25} arquivos"
        ok = messagebox.askyesno(APP_NAME, "Serão substituídos arquivos VISUAIS do DropItem, com backup automático.\n\n" + preview + "\n\nContinuar?")
        if not ok: return
        backup = make_backup(game, [dst.name for _,dst in candidates])
        for src, dst in candidates:
            shutil.copy2(src, dst)
        self.write(f"[OK] {len(candidates)} arquivo(s) aplicado(s). Backup: {backup}")
        messagebox.showinfo(APP_NAME, f"Skins aplicadas: {len(candidates)}\nBackup: {backup}")

    def restore(self):
        game = Path(self.game_var.get())
        if not is_game_root(game): return messagebox.showerror(APP_NAME, "Pasta do jogo inválida.")
        b = latest_backup(game)
        if not b: return messagebox.showwarning(APP_NAME, "Nenhum backup encontrado.")
        src = b / "DropItem"
        drop = game / "image" / "Sinimage" / "Items" / "DropItem"
        count = 0
        for p in src.iterdir():
            if p.is_file(): shutil.copy2(p, drop / p.name); count += 1
        self.write(f"[OK] Restaurado backup {b.name}: {count} arquivo(s).")
        messagebox.showinfo(APP_NAME, f"Backup restaurado: {count} arquivo(s).")

    def save_report(self):
        text = self.log.get("1.0", "end")
        path = filedialog.asksaveasfilename(defaultextension=".txt", initialfile="PristonSkinBridge-report.txt", filetypes=[("Texto", "*.txt")])
        if path:
            Path(path).write_text(text, encoding="utf-8")
            self.write(f"Relatório salvo: {path}")


if __name__ == "__main__":
    App().mainloop()
