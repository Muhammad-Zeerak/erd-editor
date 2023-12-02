import { cssUnwrap, hmr } from '@dineug/r-html';
import { ShikiService } from '@dineug/shiki-worker';
// @ts-ignore
import Stats from 'stats.js';

import { setShikiService } from './index';

function runStats() {
  const stats = new Stats();
  stats.dom.style.top = '';
  stats.dom.style.left = '';
  stats.dom.style.bottom = '20px';
  stats.dom.style.right = '20px';
  document.body.style.margin = '0';
  document.body.style.height = '100vh';
  document.body.appendChild(stats.dom);

  const animate = () => {
    stats.begin();
    stats.end();
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

function runEditor() {
  const editor = document.createElement('erd-editor');
  document.body.appendChild(editor);
}

// cssUnwrap();
hmr();
runStats();
runEditor();
setShikiService(ShikiService);
