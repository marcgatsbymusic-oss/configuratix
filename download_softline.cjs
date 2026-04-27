const https = require('https');
const fs = require('fs');
const path = require('path');

const colors = [
  { bgLocal: '/assets/softline/colors/dark-oak-meranti-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvY2llbW55X2RiLWEuanBn.webp', frameLocal: '/assets/softline/colors/dark-oak-meranti-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvY2llbW55X2RhYi1hLnBuZw==.webp', imgLocal: '/assets/softline/colors/dark-oak-meranti-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovY2llbW55X2RhYi1tZXJhbnRpLnBuZw==.webp' },
  { bgLocal: '/assets/softline/colors/dark-oak-pine-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvY2llbW55X2RiLXNvc25hLmpwZw==.webp', frameLocal: '/assets/softline/colors/dark-oak-pine-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvY2llbW55X2RhYi1zb3NuYS5wbmc=.webp', imgLocal: '/assets/softline/colors/dark-oak-pine-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovY2llbW55X2RhYl9zb3NuYS5wbmc=.webp' },
  { bgLocal: '/assets/softline/colors/teak-pine-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvdGVhay1zb3NuYS5qcGc=.webp', frameLocal: '/assets/softline/colors/teak-pine-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvdGVhay1zb3NuYS5wbmc=.webp', imgLocal: '/assets/softline/colors/teak-pine-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovdGVha19zb3NuYS5wbmc=.webp' },
  { bgLocal: '/assets/softline/colors/teak-meranthi-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvdGVhay1hLmpwZw==.webp', frameLocal: '/assets/softline/colors/teak-meranthi-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvdGVhay1hLnBuZw==.webp', imgLocal: '/assets/softline/colors/teak-meranthi-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovdGVhay1tZXJhbnRpLnBuZw==.webp' },
  { bgLocal: '/assets/softline/colors/nut-pine-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2Qvb3J6ZWNoLXNvc25hLmpwZw==.webp', frameLocal: '/assets/softline/colors/nut-pine-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvb3J6ZWNoLXNvc25hLnBuZw==.webp', imgLocal: '/assets/softline/colors/nut-pine-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovb3J6ZWNoX3Nvc25hLnBuZw==.webp' },
  { bgLocal: '/assets/softline/colors/white-softline-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvYmlhbHlfc29mdC5qcGc=.webp', frameLocal: '/assets/softline/colors/white-softline-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvYmlheS5wbmc=.webp', imgLocal: '/assets/softline/colors/white-softline-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovYmlheV9zb3NuYS5wbmc=.webp' },
  { bgLocal: '/assets/softline/colors/maghoni-pine-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvbWFjaG9zLXNvc25hLmpwZw==.webp', frameLocal: '/assets/softline/colors/maghoni-pine-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvbWFjaG9uLXNvc25hLnBuZw==.webp', imgLocal: '/assets/softline/colors/maghoni-pine-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovbWFob25fc29zbmEucG5n.webp' },
  { bgLocal: '/assets/softline/colors/maghoni-meranthi-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvbWFjaG9zLWEuanBn.webp', frameLocal: '/assets/softline/colors/maghoni-meranthi-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvbWFjaG9uLWEucG5n.webp', imgLocal: '/assets/softline/colors/maghoni-meranthi-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovbWFob24tbWVyYW50aS5wbmc=.webp' },
  { bgLocal: '/assets/softline/colors/bright-oak-pine-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvamFzbnlfZGItc29zbmEuanBn.webp', frameLocal: '/assets/softline/colors/bright-oak-pine-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvamFzbnlfZGFiLXNvc25hLnBuZw==.webp', imgLocal: '/assets/softline/colors/bright-oak-pine-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovamFzbnlfZGFiX3Nvc25hXy1fODgucG5n.webp' },
  { bgLocal: '/assets/softline/colors/bright-oak-meranthi-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvamFzbnlfZGItYS5qcGc=.webp', frameLocal: '/assets/softline/colors/bright-oak-meranthi-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvamFzbnlfZGFiLWEucG5n.webp', imgLocal: '/assets/softline/colors/bright-oak-meranthi-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovamFzbnlfZGFiLW1lcmFudGlfLV84OC5wbmc=.webp' },
  { bgLocal: '/assets/softline/colors/palisander-pine-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvcG9saXNhbmRlci1zb3NuYS5qcGc=.webp', frameLocal: '/assets/softline/colors/palisander-pine-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvcG9saXNhbmRlci1zb3NuYS5wbmc=.webp', imgLocal: '/assets/softline/colors/palisander-pine-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovcG9saXNhbmRlcl9zb3NuYS5wbmc=.webp' },
  { bgLocal: '/assets/softline/colors/palisander-meranthi-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvcG9saXNhbmRlci1hLmpwZw==.webp', frameLocal: '/assets/softline/colors/palisander-meranthi-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvcG9saXNhbmRlci1hLnBuZw==.webp', imgLocal: '/assets/softline/colors/palisander-meranthi-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovcG9saXNhbmRlci1tZXJhbnRpLnBuZw==.webp' },
  { bgLocal: '/assets/softline/colors/nut-meranthi-bg.webp', originalBg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L3dvb2Qvb3J6ZWNoLWEuanBn.webp', frameLocal: '/assets/softline/colors/nut-meranthi-frame.webp', originalFrame: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItZnJvbnQvb3J6ZWNoLWEucG5n.webp', imgLocal: '/assets/softline/colors/nut-meranthi-img.webp', originalImg: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvU09GVExJTkUva29sb3ItcHJ6ZWtyb2ovb3J6ZWNoLW1lcmFudGkucG5n.webp' }
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(); return; // Ignore errors
      }
      const file = fs.createWriteStream(path.join(__dirname, 'public', dest));
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', (err) => {
      fs.unlink(dest, () => resolve()); // Delete the file async.
    });
  });
};

(async () => {
  for (const c of colors) {
    await downloadFile(c.originalBg, c.bgLocal);
    await downloadFile(c.originalFrame, c.frameLocal);
    await downloadFile(c.originalImg, c.imgLocal);
  }
  console.log('All downloads completed!');
})();
