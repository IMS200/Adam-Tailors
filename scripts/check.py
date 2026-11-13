#!/usr/bin/env python3
"""Dependency-free source checks. Run from any working directory."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json
import re

root = Path(__file__).resolve().parent.parent
class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.assets, self.h1 = set(), [], [], 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, 'Duplicate ID'
            self.ids.add(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'a': self.links.append(a.get('href', ''))
        if tag == 'img':
            assert a.get('alt'), 'Image missing meaningful alt text'
            self.assets.append(a['src'])
        if tag in ('script', 'link'):
            source = a.get('src', a.get('href', ''))
            if source.startswith('./'): self.assets.append(source)
text = (root / 'index.html').read_text()
p = Page()
p.feed(text)
assert p.h1 == 1
for link in p.links:
    if link.startswith('#') and len(link) > 1: assert link[1:] in p.ids, link
    if link.startswith('tel:'): assert link == 'tel:+447898535367', link
for asset in p.assets: assert (root / asset).is_file(), asset
maps = [link for link in p.links if 'google.com/maps/search/' in link]
assert len(maps) == 1
assert parse_qs(urlparse(maps[0]).query)['query'] == ['17A Bury New Road, Salford, M8 8FW, United Kingdom']
data = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)[1])
assert data['alternateName'] == 'آدم للخياطة'
assert 'openingHours' not in data and 'aggregateRating' not in data
assert text.count('lang="ar" dir="rtl"') == 3
assert (root / 'assets/social.jpg').is_file()
print('PASS: headings, anchors, local assets, phone links, directions, Arabic and structured data.')
