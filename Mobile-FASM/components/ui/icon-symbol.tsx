// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, MaterialIconName> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'book.fill': 'menu-book',
  'doc.text.fill': 'description',
  'bell.fill': 'notifications',
  'person.crop.circle': 'person',
  'safari.fill': 'explore',
  'magnifyingglass': 'search',
  'pencil': 'edit',
  'person.fill': 'person',
  'lock.fill': 'lock',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'arrow.left': 'arrow-back',
  'plus': 'add',
  'calendar': 'calendar-today',
  'clock': 'access-time',
  'mappin.and.ellipse': 'location-on',
  'moon.fill': 'dark-mode',
  'questionmark.circle.fill': 'help',
  'envelope.fill': 'email',
  'rectangle.portrait.and.arrow.right': 'logout',
  'star.fill': 'star',
  'bubble.left.fill': 'chat-bubble',
  'exclamationmark.circle.fill': 'error',
  'checkmark.circle.fill': 'check-circle',
  'info.circle.fill': 'info',
  'gearshape.fill': 'settings',
  'person.crop.rectangle.fill': 'badge',
  'map.fill': 'map',
  'briefcase.fill': 'work',
  'book.circle.fill': 'book',
  'graduationcap.fill': 'school',
  'ellipsis': 'more-horiz',
  'ellipsis.vertical': 'more-vert',
  'trash.fill': 'delete',
  'square.grid.2x2.fill': 'dashboard',
  'list.bullet.rectangle.fill': 'list-alt',
  'person.2.fill': 'people',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
