import { View, type ViewProps } from 'react-native';

type Direction = 'row' | 'column';

type Props = ViewProps & {
  direction?: Direction;
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  wrap?: boolean;
};

export function Stack({
  direction = 'column',
  gap = 0,
  align,
  justify,
  wrap,
  style,
  ...rest
}: Props) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
      {...rest}
    />
  );
}
