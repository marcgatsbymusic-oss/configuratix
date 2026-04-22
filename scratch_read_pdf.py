import sys
try:
    from pypdf import PdfReader
except ImportError:
    try:
        import PyPDF2
        from PyPDF2 import PdfReader
    except ImportError:
        print("No pypdf or PyPDF2 found")
        sys.exit(1)

reader = PdfReader('C:/Users/Shadow/Desktop/Format debug page.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"
print("PDF TEXT:\n" + text)
