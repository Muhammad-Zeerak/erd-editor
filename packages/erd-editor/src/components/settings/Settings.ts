import { delay } from '@dineug/go';
import {
  createRef,
  FC,
  html,
  observable,
  onUpdated,
  ref,
  repeat,
} from '@dineug/r-html';

import { useAppContext } from '@/components/appContext';
import Button from '@/components/primitives/button/Button';
import Menu from '@/components/primitives/context-menu/menu/Menu';
import Icon from '@/components/primitives/icon/Icon';
import Separator from '@/components/primitives/separator/Separator';
import Switch from '@/components/primitives/switch/Switch';
import Toast from '@/components/primitives/toast/Toast';
import SettingsLnb, {
  Lnb,
} from '@/components/settings/settings-lnb/SettingsLnb';
import Shortcuts from '@/components/settings/shortcuts/Shortcuts';
import { ColumnTypeToName } from '@/constants/schema';
import {
  changeColumnOrderAction,
  changeRelationshipDataTypeSyncAction,
} from '@/engine/modules/settings/atom.actions';
import { fontSize6 } from '@/styles/typography.styles';
import { recalculateTableWidth } from '@/utils/calcTable';
import { onPrevent } from '@/utils/domEvent';
import { relationshipSort } from '@/utils/draw-relationship/sort';
import { openToastAction } from '@/utils/emitter';
import { FlipAnimation } from '@/utils/flipAnimation';
import { fromShadowDraggable } from '@/utils/rx-operators/fromShadowDraggable';

import * as styles from './Settings.styles';

export type SettingsProps = {};

const Settings: FC<SettingsProps> = (props, ctx) => {
  const app = useAppContext(ctx);
  const root = createRef<HTMLDivElement>();
  const flipAnimation = new FlipAnimation(
    root,
    `.${styles.columnOrderItem}`,
    'column-order-move'
  );

  const state = observable({
    lnb: Lnb.preferences as Lnb,
  });

  const handleChangeRelationshipDataTypeSync = (value: boolean) => {
    const { store } = app.value;
    store.dispatch(changeRelationshipDataTypeSyncAction({ value }));
  };

  const handleRecalculationTableWidth = () => {
    const { store, emitter, toWidth } = app.value;
    recalculateTableWidth(store.state, { toWidth });
    relationshipSort(store.state);
    emitter.emit(
      openToastAction({
        close: delay(2000),
        message: html`<${Toast} title="Recalculated table width" />`,
      })
    );
  };

  const handleChangeColumnOrderAction = (value: number, target: number) => {
    const { store } = app.value;

    if (value !== target) {
      flipAnimation.snapshot();
      store.dispatch(changeColumnOrderAction({ value, target }));
    }
  };

  const handleDragstartColumnOrder = (event: DragEvent) => {
    const $root = root.value;
    const $target = event.target as HTMLElement | null;
    if (!$root || !$target) return;

    const columnType = Number($target.dataset.id);
    const elements = Array.from<HTMLElement>(
      $root.querySelectorAll(`.${styles.columnOrderItem}`)
    );
    elements.forEach(el => el.classList.add('none-hover'));
    $target.classList.add('draggable');

    fromShadowDraggable(elements).subscribe({
      next: id => {
        handleChangeColumnOrderAction(columnType, Number(id));
      },
      complete: () => {
        $target.classList.remove('draggable');
        elements.forEach(el => el.classList.remove('none-hover'));
      },
    });
  };

  onUpdated(() => flipAnimation.play());

  const handleChangeLnb = (value: Lnb) => {
    state.lnb = value;
  };

  return () => {
    const { store } = app.value;
    const { settings } = store.state;

    return html`
      <div class=${styles.root} ${ref(root)}>
        <div class=${styles.lnbArea}>
          <${SettingsLnb} value=${state.lnb} .onChange=${handleChangeLnb} />
        </div>
        <div class=${styles.contentArea}>
          <div class=${fontSize6}>${state.lnb}</div>
          <${Separator} space=${12} />
          <div class=${['scrollbar', styles.content]}>
            ${state.lnb === Lnb.preferences
              ? html`
                  <div class=${styles.section}>
                    <div class=${styles.row}>
                      <div>Relationship DataType Sync</div>
                      <div class=${styles.vertical(16)}></div>
                      <${Switch}
                        value=${settings.relationshipDataTypeSync}
                        .onChange=${handleChangeRelationshipDataTypeSync}
                      />
                    </div>
                    <div class=${styles.row}>
                      <div>Recalculation table width</div>
                      <div class=${styles.vertical(16)}></div>
                      <${Button}
                        variant="soft"
                        size="1"
                        text=${html`
                          <${Icon} size=${14} name="rotate" />
                          <div class=${styles.vertical(8)}></div>
                          <span>Sync</span>
                        `}
                        .onClick=${handleRecalculationTableWidth}
                      />
                    </div>
                    <div class=${styles.columnOrderSection}>
                      <div>Column Order</div>
                      <${Separator} space=${12} />
                      <div
                        class=${styles.columnOrderList}
                        @dragenter=${onPrevent}
                        @dragover=${onPrevent}
                      >
                        ${repeat(
                          settings.columnOrder,
                          columnType => columnType,
                          columnType => html`
                            <div
                              class=${styles.columnOrderItem}
                              draggable="true"
                              data-id=${columnType}
                              @dragstart=${handleDragstartColumnOrder}
                            >
                              <${Menu}
                                icon=${html`<${Icon} name="bars" size=${14} />`}
                                name=${ColumnTypeToName[columnType]}
                              />
                            </div>
                          `
                        )}
                      </div>
                    </div>
                  </div>
                `
              : state.lnb === Lnb.shortcuts
              ? html`<${Shortcuts} />`
              : null}
          </div>
        </div>
      </div>
    `;
  };
};

export default Settings;
