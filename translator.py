# translate_quiz_to_bosnian.py
# Automatski prevodi quiz .js fajl na bosanski jezik

import re
from deep_translator import GoogleTranslator

input_file = "main.js"
output_file = "glavni.js"

translator = GoogleTranslator(source="en", target="bs")

def translate_text(text):
    """Prevodi tekst koristeći Google Translate, sa zaštitom od grešaka."""
    try:
        return translator.translate(text)
    except Exception:
        return text  # Ako ne uspije, vrati original

translated_lines = []

with open(input_file, "r", encoding="utf-8") as f:
    for line in f:
        # Prevedi samo vrijednosti unutar navodnika, ne ključeve
        matches = re.findall(r'\"(.*?)\"', line)
        new_line = line
        for match in matches:
            # preskoči JS ključeve i konstante
            if match in ["category", "question", "options", "answer", "const", "questions"]:
                continue
            bosnian = translate_text(match)
            new_line = new_line.replace(f"\"{match}\"", f"\"{bosnian}\"")
        translated_lines.append(new_line)

with open(output_file, "w", encoding="utf-8") as f:
    f.writelines(translated_lines)

print("✅ Prevod završen! Fajl je sačuvan kao:", output_file)
