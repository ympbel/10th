import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entries, scalar, page, BASE } from './helpers.mjs';
const photos = entries('photos');
for (const prefix of ['', 'en/']) {
 test(`${prefix || 'ko/'}: album covers lead to every photo exactly once`, () => {
   const $ = page(prefix + 'archive/photos');
   const cards = $('.photo-album');
   const expectedAlbums = new Set(photos.map(p => scalar(p.fm,'date') + ':' + scalar(p.fm,'caption')));
   assert.equal(cards.length, expectedAlbums.size);
   const ids = [];
   cards.each((_, card) => {
     const link = $(card).find('a').attr('href');
     assert.ok(link.startsWith(BASE + '/' + prefix + 'archive/albums/'));
     const album = page(link.slice(BASE.length + 1));
     const figures = album('.photo-story-images figure[data-photo]');
     assert.equal(figures.length, Number($(card).attr('data-photo-count')));
     figures.each((_, figure) => ids.push(album(figure).attr('data-photo')));
   });
   assert.deepEqual(ids.sort(), photos.map(p=>p.id).sort());
 });
}
