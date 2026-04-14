import sys
import subprocess

# Попробуем использовать LibreOffice для конвертации, если установлен
# Или catdoc / antiword

doc_path = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\demas\Desktop\66D0~1\-1871B~1.DOC"

# Попробуем antiword
try:
    result = subprocess.run(["antiword", doc_path], capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        print(result.stdout)
        sys.exit(0)
except FileNotFoundError:
    pass

# Попробуем python-docx (но это только для .docx)
try:
    import olefile
    ole = olefile.OleFileIO(doc_path)
    
    # Word .doc хранит текст в WordDocument stream
    if ole.exists('WordDocument'):
        stream = ole.openstream('WordDocument')
        data = stream.read()
        # Извлекаем ASCII и Unicode текст
        text = ""
        # Пропускаем FIB и извлекаем текст
        # В старых .doc текст начинается после FIB (обычно ~1500 байт)
        for i in range(512, len(data), 2):
            byte = data[i]
            if byte == 0:
                continue
            if 32 <= byte < 127 or byte in (10, 13, 9):
                text += chr(byte)
            elif byte == 13:
                text += '\n'
            else:
                text += ' '
        
        print(text[:10000])
        sys.exit(0)
except ImportError:
    pass
except Exception as e:
    print(f"Ошибка olefile: {e}", file=sys.stderr)

# Fallback: извлечём все читаемые строки из бинарного файла
with open(doc_path, 'rb') as f:
    data = f.read()

text = ""
current = ""
for byte in data:
    if 32 <= byte < 127 or byte in (10, 13, 9):
        current += chr(byte)
    else:
        if len(current) >= 3:
            text += current + "\n"
        current = ""

if len(current) >= 3:
    text += current

print(text[:10000])
