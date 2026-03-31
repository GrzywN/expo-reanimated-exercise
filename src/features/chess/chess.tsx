import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';

import { FILES, RANKS, BOARD_SIZE, SQUARE_SIZE, pieceLand } from './constants';
import { useChessGame } from './hooks/use-chess-game';
import { useChessDrag } from './hooks/use-chess-drag';
import { useChessAnimations } from './hooks/use-chess-animations';
import { BoardSquare } from './components/board-square';
import { EndOverlay } from './components/end-overlay';
import { Piece } from './components/piece';

export function Chess() {
  const game = useChessGame();
  const drag = useChessDrag({
    validMovesRef: game.validMovesRef,
    onHandleSquare: game.handleSquare,
    onSelectPiece: game.selectPiece,
    onExecuteMove: game.executeMove,
    onClearSelection: game.clearSelection,
  });
  const animation = useChessAnimations(game.config);
  const validMovesSet = new Set(game.validMoves);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={drag.gesture}>
        <View style={styles.board}>
          {RANKS.map((rank, rankIndex) =>
            FILES.map((file, fileIndex) => {
              const square = file + rank;
              const piece = game.config.pieces[square] as string | undefined;
              const isLandingSquare = game.lastMove?.to === square;
              const isInitialRender = game.lastMove === null;
              const squareIndex = rankIndex * 8 + fileIndex;

              return (
                <BoardSquare
                  key={square}
                  piece={piece}
                  isLight={(rankIndex + fileIndex) % 2 === 0}
                  isSelected={game.selected === square}
                  isValidMove={validMovesSet.has(square)}
                  isLastMoveSquare={
                    game.lastMove?.from === square || isLandingSquare
                  }
                  isDragSource={
                    drag.floatingPiece !== null && game.selected === square
                  }
                  pieceKey={
                    isLandingSquare
                      ? `land-${game.lastMove!.from}-${game.lastMove!.to}`
                      : square
                  }
                  pieceEntering={
                    isInitialRender
                      ? FadeIn.delay(squareIndex * 12).duration(350)
                      : isLandingSquare
                      ? pieceLand
                      : undefined
                  }
                />
              );
            })
          )}

          {/* King check pulse */}
          {animation.kingCheckPos && (
            <Animated.View
              style={[
                styles.kingCheckOverlay,
                animation.kingCheckPos,
                animation.kingCheckStyle,
              ]}
              pointerEvents="none"
            />
          )}

          {/* Floating piece during drag */}
          <Animated.View style={drag.floatingStyle}>
            {drag.floatingPiece && (
              <Piece piece={drag.floatingPiece} size={SQUARE_SIZE * 0.85} />
            )}
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Turn change flash */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.turnFlashOverlay,
          animation.turnFlashStyle,
        ]}
        pointerEvents="none"
      />

      {/* Check / checkmate screen flash */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.checkOverlay,
          animation.checkOverlayStyle,
        ]}
        pointerEvents="none"
      />

      {game.config.isFinished && (
        <EndOverlay checkMate={game.config.checkMate} turn={game.config.turn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  kingCheckOverlay: {
    position: 'absolute',
    backgroundColor: '#cc0000',
  },
  turnFlashOverlay: {
    backgroundColor: '#ffffff',
  },
  checkOverlay: {
    backgroundColor: '#cc0000',
  },
});
