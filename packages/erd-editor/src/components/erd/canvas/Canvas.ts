import { cache, FC, html, repeat } from '@dineug/r-html';

import { useAppContext } from '@/components/context';
import Memo from '@/components/erd/canvas/memo/Memo';
import Table from '@/components/erd/canvas/table/Table';
import { query } from '@/utils/collection/query';

import * as styles from './Canvas.styles';

export type CanvasProps = {};

const Canvas: FC<CanvasProps> = (props, ctx) => {
  const app = useAppContext(ctx);

  return () => {
    const { store } = app.value;
    const {
      settings: { width, height, scrollTop, scrollLeft, zoomLevel, show },
      doc: { tableIds, memoIds },
      collections,
    } = store.state;

    const tables = query(collections)
      .collection('tableEntities')
      .selectByIds(tableIds);

    const memos = query(collections)
      .collection('memoEntities')
      .selectByIds(memoIds);

    return html`<div
      class=${styles.root}
      style=${{
        width: `${width}px`,
        height: `${height}px`,
        'min-width': `${width}px`,
        'min-height': `${height}px`,
        transform: `translate(${scrollLeft}px, ${scrollTop}px) scale(${zoomLevel})`,
      }}
    >
      ${cache(
        zoomLevel > 0.7
          ? html`${repeat(
              tables,
              table => table.id,
              table => html`<${Table} table=${table} />`
            )}`
          : null
      )}
      ${repeat(
        memos,
        memo => memo.id,
        memo => html`<${Memo} memo=${memo} />`
      )}
    </div>`;
  };
};

export default Canvas;