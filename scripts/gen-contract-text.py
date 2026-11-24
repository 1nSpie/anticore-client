#!/usr/bin/env python3
"""
Собирает юридический текст договора из DOCX-шаблона `public/templates/dogovor-client.docx` в
`src/app/admin/components/crm/pdf/contractText.generated.ts` — для PDF-версии договора.
Текст не перепечатывается вручную: при изменении шаблона запустите скрипт и закоммитьте результат.

    python3 scripts/gen-contract-text.py
"""
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/templates/dogovor-client.docx"
OUT = ROOT / "src/app/admin/components/crm/pdf/contractText.generated.ts"

FOOTER = re.compile(r"^Договор\s*№\s*\{\{CONTRACT_NO\}\}\s*Стр\.\s*\d+\s*из\s*\d+$")
HEADING = re.compile(r"^\d+\.\s+[А-ЯЁ][А-ЯЁ\s\-,]+$")
SUBHEADING = re.compile(r"^\d+\.\d+\s+[А-ЯЁ][А-ЯЁ\s\-,]+$")
CLAUSE = re.compile(r"^\d+(\.\d+)*\.?\s")


def ptext(p):
    """Текст абзаца; перенос строки и конец вложенного абзаца (например, в надписи) дают новую строку."""
    out = []

    def visit(el, top):
        for e in el:
            if e.tag == W + "t":
                out.append(e.text or "")
            elif e.tag == W + "br" and e.get(W + "type") != "page":
                out.append("\n")
            elif e.tag == W + "tab":
                out.append(" ")
            else:
                visit(e, False)
                if e.tag == W + "p":
                    out.append("\n")

    visit(p, True)
    return "".join(out)


def norm(line):
    return re.sub(r"\s+", " ", line).strip()


def lines_of(paragraphs):
    """Строки абзацев: переносы внутри абзаца — отдельные строки, колонтитулы страниц отбрасываются."""
    for p in paragraphs:
        for raw in ptext(p).split("\n"):
            line = norm(raw)
            if line and not FOOTER.match(line):
                yield line


def blocks(lines):
    """Склеивает строки в абзацы: строка без номера пункта продолжает предыдущую."""
    out = []
    for line in lines:
        kind = "h" if (HEADING.match(line) or SUBHEADING.match(line)) else "p"
        starts_new = (
            kind == "h" or CLAUSE.match(line) or line.startswith(("—", "☐", "Подпись", "Начало работ", "Окончание работ", "{{"))
        )
        # после пункта списка («— …») следующая строка без «—» — новый абзац
        after_bullet = bool(out) and out[-1]["t"].startswith("—") and not line.startswith("—")
        if not out or starts_new or after_bullet or out[-1]["k"] == "h":
            out.append({"k": kind, "t": line})
        else:
            out[-1]["t"] += " " + line
    return out


def cell_lines(tc):
    return list(lines_of(tc.findall(W + "p")))


z = zipfile.ZipFile(SRC)
body = ET.fromstring(z.read("word/document.xml")).find(W + "body")
kids = list(body)
tables = [i for i, c in enumerate(kids) if c.tag == W + "tbl"]
assert len(tables) == 3, tables
t_parties, t_vehicle, t_terms = tables


def paras(a, b):
    return [c for c in kids[a:b] if c.tag == W + "p"]


# вводная часть после таблицы сторон: нас интересует только предложение про раздел 2
intro = blocks(lines_of(paras(t_parties + 1, t_parties + 8)))
intro_vehicle = next(b["t"] for b in intro if "Договор заключается в отношении" in b["t"] or "данные которого" in b["t"])
# строка предложения разорвана форматированием: берём всё, что относится к «Договор заключается…» и «Данные транспортного…»
text_all = " ".join(norm(ptext(p)) for p in paras(t_parties + 1, t_parties + 8))
m = re.search(r"(Договор заключается в отношении.*?перечень работ»\.)", text_all)
intro_vehicle = m.group(1) if m else intro_vehicle

# раздел 1 — от заголовка «1. ПРЕДМЕТ ДОГОВОРА» до таблицы раздела 2 (там же заголовок «2. …»)
sec1_paras = paras(t_parties + 1, t_vehicle)
all1 = blocks(lines_of(sec1_paras))
start = next(i for i, b in enumerate(all1) if b["t"].startswith("1. ПРЕДМЕТ ДОГОВОРА"))
end = next(i for i, b in enumerate(all1) if b["t"].startswith("2. ДАННЫЕ"))
section1 = all1[start:end]
heading2 = all1[end]["t"]

# таблица раздела 2: статические пункты 2.1.1, 2.1.2, 2.2.1, 2.2.2
rows = kids[t_vehicle].findall(W + "tr")


def row_cell(r, c):
    return cell_lines(rows[r].findall(W + "tc")[c])


def joined(lines):
    return [b["t"] for b in blocks(lines)]


vehicle_notes = {
    "left": joined(row_cell(6, 0) + row_cell(7, 0)),
    "right": joined(row_cell(6, 1) + row_cell(7, 1)),
    "leftTitle": norm(" ".join(row_cell(0, 0))),
    "rightTitle": norm(" ".join(row_cell(0, 1))),
}

# 2.3 информированное согласие: абзацы между таблицей раздела 2 и таблицей раздела 3/4
consent = blocks(lines_of(paras(t_vehicle + 1, t_terms)))

# таблица разделов 3 и 4
tcs = kids[t_terms].findall(W + "tr")[0].findall(W + "tc")
section3 = blocks(cell_lines(tcs[0]))
section4 = blocks(cell_lines(tcs[1]))

# разделы 5–10 и подписи
tail_paras = [c for c in kids[t_terms + 1 :] if c.tag == W + "p"]
tail = blocks(lines_of(tail_paras))
# подписи — короткие строки, начинающиеся с «Исполнитель» (пункты договора с этим словом длиннее)
sign_at = next((i for i, b in enumerate(tail) if b["t"].startswith("Исполнитель") and len(b["t"]) < 120), len(tail))
sections_5_10 = tail[:sign_at]
# строка подписей шаблона («Исполнитель Заказчик /____/ {{FIO}} … {{ORG_SIGNER}}») слита с последним пунктом: в PDF подписи рисуются отдельно
SIGNATURE_TAIL = re.compile(r"\s+Исполнитель\s+Заказчик\b.*$")
sections_5_10[-1]["t"] = SIGNATURE_TAIL.sub("", sections_5_10[-1]["t"])
assert "{{" not in sections_5_10[-1]["t"], sections_5_10[-1]["t"]

data = {
    "introVehicle": intro_vehicle,
    "section1": section1,
    "heading2": heading2,
    "vehicleNotes": vehicle_notes,
    "consent": consent,
    "section3": section3,
    "section4": section4,
    "sections5to10": sections_5_10,
}
header = (
    "// ФАЙЛ СГЕНЕРИРОВАН scripts/gen-contract-text.py из public/templates/dogovor-client.docx — не править вручную.\n"
    "// Юридический текст договора для PDF-версии; изменили шаблон — перегенерируйте.\n\n"
    "export type ContractBlock = { k: \"h\" | \"p\"; t: string };\n\n"
    "export const CONTRACT_TEXT = "
)
OUT.write_text(header + json.dumps(data, ensure_ascii=False, indent=2) + " as const;\n", encoding="utf-8")
print("written", OUT.relative_to(ROOT), "blocks:", {k: len(v) if isinstance(v, list) else "-" for k, v in data.items()})
