import { ValuesType } from '@/internal-types';
import { isIOS, isMacOs } from '@/utils/device-detect';

import { KeyBindingPress, parseKeybinding } from './tinykeys';

export type ShortcutOption = {
  shortcut: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

export const KeyBindingName = {
  edit: 'edit',
  stop: 'stop',
  find: 'find',
  undo: 'undo',
  redo: 'redo',
  addTable: 'addTable',
  addColumn: 'addColumn',
  addMemo: 'addMemo',
  removeTable: 'removeTable',
  removeColumn: 'removeColumn',
  primaryKey: 'primaryKey',
  selectAllTable: 'selectAllTable',
  selectAllColumn: 'selectAllColumn',
  copyColumn: 'copyColumn',
  pasteColumn: 'pasteColumn',
  relationshipZeroOne: 'relationshipZeroOne',
  relationshipZeroN: 'relationshipZeroN',
  relationshipOneOnly: 'relationshipOneOnly',
  relationshipOneN: 'relationshipOneN',
  tableProperties: 'tableProperties',
  zoomIn: 'zoomIn',
  zoomOut: 'zoomOut',
} as const;
export type KeyBindingName = ValuesType<typeof KeyBindingName>;

export type KeyBindingMap = {
  [KeyBindingName.edit]: ShortcutOption[];
  [KeyBindingName.stop]: ShortcutOption[];
  [KeyBindingName.find]: ShortcutOption[];
  [KeyBindingName.undo]: ShortcutOption[];
  [KeyBindingName.redo]: ShortcutOption[];
  [KeyBindingName.addTable]: ShortcutOption[];
  [KeyBindingName.addColumn]: ShortcutOption[];
  [KeyBindingName.addMemo]: ShortcutOption[];
  [KeyBindingName.removeTable]: ShortcutOption[];
  [KeyBindingName.removeColumn]: ShortcutOption[];
  [KeyBindingName.primaryKey]: ShortcutOption[];
  [KeyBindingName.selectAllTable]: ShortcutOption[];
  [KeyBindingName.selectAllColumn]: ShortcutOption[];
  [KeyBindingName.copyColumn]: ShortcutOption[];
  [KeyBindingName.pasteColumn]: ShortcutOption[];
  [KeyBindingName.relationshipZeroOne]: ShortcutOption[];
  [KeyBindingName.relationshipZeroN]: ShortcutOption[];
  [KeyBindingName.relationshipOneOnly]: ShortcutOption[];
  [KeyBindingName.relationshipOneN]: ShortcutOption[];
  [KeyBindingName.tableProperties]: ShortcutOption[];
  [KeyBindingName.zoomIn]: ShortcutOption[];
  [KeyBindingName.zoomOut]: ShortcutOption[];
};

export const createKeyBindingMap = (): KeyBindingMap => ({
  [KeyBindingName.edit]: [{ shortcut: 'Enter' }],
  [KeyBindingName.stop]: [{ shortcut: 'Escape' }],
  [KeyBindingName.find]: [
    { shortcut: '$mod+KeyF', preventDefault: true, stopPropagation: true },
  ],
  [KeyBindingName.undo]: [{ shortcut: '$mod+KeyZ', preventDefault: true }],
  [KeyBindingName.redo]: [
    { shortcut: '$mod+Shift+KeyZ', preventDefault: true },
  ],
  [KeyBindingName.addTable]: [{ shortcut: 'Alt+KeyN' }],
  [KeyBindingName.addColumn]: [{ shortcut: 'Alt+Enter' }],
  [KeyBindingName.addMemo]: [{ shortcut: 'Alt+KeyM' }],
  [KeyBindingName.removeTable]: [
    { shortcut: '$mod+Backspace' },
    { shortcut: '$mod+Delete' },
  ],
  [KeyBindingName.removeColumn]: [
    { shortcut: 'Alt+Backspace' },
    { shortcut: 'Alt+Delete' },
  ],
  [KeyBindingName.primaryKey]: [{ shortcut: 'Alt+KeyK' }],
  [KeyBindingName.selectAllTable]: [{ shortcut: '$mod+Alt+KeyA' }],
  [KeyBindingName.selectAllColumn]: [{ shortcut: 'Alt+KeyA' }],
  [KeyBindingName.copyColumn]: [{ shortcut: '$mod+KeyC' }],
  [KeyBindingName.pasteColumn]: [{ shortcut: '$mod+KeyV' }],
  [KeyBindingName.relationshipZeroOne]: [{ shortcut: '$mod+Alt+Digit1' }],
  [KeyBindingName.relationshipZeroN]: [{ shortcut: '$mod+Alt+Digit2' }],
  [KeyBindingName.relationshipOneOnly]: [{ shortcut: '$mod+Alt+Digit3' }],
  [KeyBindingName.relationshipOneN]: [{ shortcut: '$mod+Alt+Digit4' }],
  [KeyBindingName.tableProperties]: [{ shortcut: 'Alt+Space' }],
  [KeyBindingName.zoomIn]: [
    { shortcut: '$mod+Equal', preventDefault: true, stopPropagation: true },
  ],
  [KeyBindingName.zoomOut]: [
    { shortcut: '$mod+Minus', preventDefault: true, stopPropagation: true },
  ],
});

const APPLE_DEVICE = isMacOs || isIOS;

const ModifierKey = {
  Shift: 'Shift',
  Meta: 'Meta',
  Alt: 'Alt',
  Control: 'Control',
} as const;
type ModifierKey = ValuesType<typeof ModifierKey>;

const MacModifierKeyMap: Record<ModifierKey, string> = {
  [ModifierKey.Shift]: '⇧', // Shift
  [ModifierKey.Meta]: '⌘', // Cmd
  [ModifierKey.Alt]: '⌥', // Option
  [ModifierKey.Control]: '⌃', // Ctrl
};

const WindowsModifierKeyMap: Record<ModifierKey, string> = {
  [ModifierKey.Shift]: 'Shift',
  [ModifierKey.Meta]: 'Cmd',
  [ModifierKey.Alt]: 'Alt',
  [ModifierKey.Control]: 'Ctrl',
};

function modifierKeyToString(key: string) {
  const modifierKeyMap = APPLE_DEVICE
    ? MacModifierKeyMap
    : WindowsModifierKeyMap;
  return modifierKeyMap[key as ModifierKey] ?? key;
}

function codeToString(code: string) {
  if (code.startsWith('Key')) {
    return code.slice(3);
  }

  if (code.startsWith('Digit')) {
    return code.slice(5);
  }

  if (code === 'Backspace') {
    return '⌫';
  }

  if (code === 'Escape') {
    return 'ESC';
  }

  return code;
}

export function shortcutToTuple(options: ShortcutOption[]): KeyBindingPress[] {
  const shortcut: string | null = options[0]?.shortcut ?? null;
  return shortcut
    ? parseKeybinding(shortcut).map(([mods, key]) => [
        mods.map(modifierKeyToString),
        codeToString(key),
      ])
    : [];
}