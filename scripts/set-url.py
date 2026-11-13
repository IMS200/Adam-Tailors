#!/usr/bin/env python3
"""Set canonical and social metadata after the final public address is known."""
import html
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlparse

if len(sys.argv) != 2 or urlparse(sys.argv[1]).scheme != 'https' or not urlparse(sys.argv[1]).netloc:
    raise SystemExit('Usage: python3 scripts/set-url.py https://USERNAME.github.io/adam-tailors-preview/')
url = sys.argv[1].rstrip('/') + '/'
page = Path(__file__).resolve().parent.parent / 'index.html'
text = page.read_text()
text = re.sub(r'<link rel="canonical"[^>]*>\n?|<meta property="og:url"[^>]*>\n?', '', text)
text = text.replace('</head>', '<link rel="canonical" href="' + html.escape(url, quote=True) + '">\n<meta property="og:url" content="' + html.escape(url, quote=True) + '">\n</head>')
text = re.sub(r'(<meta property="og:image" content=")[^"]*', lambda m: m[1] + html.escape(url + 'assets/social.jpg', quote=True), text)
def update_business(match):
    data = json.loads(match[1])
    data['url'] = url
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'
text = re.sub(r'<script type="application/ld\+json">(.*?)</script>', update_business, text, flags=re.S)
page.write_text(text)
print('Canonical, social and business URLs updated to ' + url)
