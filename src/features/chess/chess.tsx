import { View, Pressable, StyleSheet, Dimensions } from 'react-native';

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

const BOARD_SIZE = Dimensions.get('window').width; // kwadrat na cały ekran
const SQUARE_SIZE = BOARD_SIZE / 8;

export function Chess() {
  const handleSquare = (square: string) => {
    console.log(square);
  };

  return (
    <View style={styles.board}>
      {RANKS.map((rank, rankIndex) =>
        FILES.map((file, fileIndex) => {
          const square = file + rank;
          const isLight = (rankIndex + fileIndex) % 2 === 0;
          // const isSelected  = selected === square
          // const isLastMove  = lastMove && (lastMove.from === square || lastMove.to === square)
          // const isValid     = validMoves.includes(square)

          return (
            <Pressable
              key={square}
              style={[
                styles.square,
                isLight ? styles.squareLight : styles.squareDark,
                // isSelected && styles.squareSelected,
                // isLastMove && styles.squareLastMove,
              ]}
              onPress={() => handleSquare(square)}
            />
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
  },

  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  squareLight: {
    backgroundColor: '#f0d9b5',
  },

  squareDark: {
    backgroundColor: '#b58863',
  },

  squareSelected: {
    backgroundColor: '#f6f669',
  },

  squareLastMove: {
    backgroundColor: '#cdd16e',
  },
});
