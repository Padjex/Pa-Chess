import {
  kingMoves,
  knightMoves,
  queenMoves,
  rookMoves,
  bishopMoves,
  pawnWhiteMoves,
  pawnBlackMoves,
} from "../moveFigures/moveFigures";

export const checkAvailableSquares = (figures, chessMatrix, color) => {
  const availableSquare = figures.some((square) => {
    // king check
    if (square.figure.includes("king")) {
      const kingSquares = kingMoves({
        chessMatrix,
        curX: square.tableLocation[0],
        curY: square.tableLocation[1],
        figure: square.figure,
        playerColor: color,
        checkForMate: true,
      });
      // console.log("King: " + kingSquares);
      if (kingSquares > 0) {
        return true;
      }
    }
    // rook check
    if (square.figure.includes("rook")) {
      // console.log("rook: " + square.figure);
      const rookSquares = rookMoves({
        chessMatrix,
        curX: square.tableLocation[0],
        curY: square.tableLocation[1],
        figure: square.figure,
        playerColor: color,
        checkForMate: true,
      });
      // console.log("Rook: " + rookSquares);
      if (rookSquares > 0) {
        return true;
      }
    }
    // queen check
    if (square.figure.includes("queen")) {
      const queenSquares = queenMoves({
        chessMatrix,
        curX: square.tableLocation[0],
        curY: square.tableLocation[1],
        figure: square.figure,
        playerColor: color,
        checkForMate: true,
      });
      // console.log("Queen: " + queenSquares);
      if (queenSquares > 0) {
        return true;
      }
    }

    // knight check
    if (square.figure.includes("knight")) {
      const knightSquares = knightMoves({
        chessMatrix,
        curX: square.tableLocation[0],
        curY: square.tableLocation[1],
        figure: square.figure,
        playerColor: color,
        checkForMate: true,
      });
      // console.log("Knight: " + knightSquares);
      if (knightSquares > 0) {
        return true;
      }
    }

    // bishop check
    if (square.figure.includes("bishop")) {
      const bishopSquares = bishopMoves({
        chessMatrix,
        curX: square.tableLocation[0],
        curY: square.tableLocation[1],
        figure: square.figure,
        playerColor: color,
        checkForMate: true,
      });
      // console.log("Bishop: " + bishopSquares);
      if (bishopSquares > 0) {
        return true;
      }
    }

    // pawn white check
    if (square.figure.includes("white pawn")) {
      const whitePawnSquares = pawnWhiteMoves({
        chessMatrix,
        curX: square.tableLocation[0],
        curY: square.tableLocation[1],
        figure: square.figure,
        playerColor: color,
        checkForMate: true,
      });
      // console.log("WhitePawn: " + whitePawnSquares);
      if (whitePawnSquares > 0) {
        return true;
      }
    }
    // pawn black check
    if (square.figure.includes("black pawn")) {
      const blackPawnSquares = pawnBlackMoves({
        chessMatrix,
        curX: square.tableLocation[0],
        curY: square.tableLocation[1],
        figure: square.figure,
        playerColor: color,
        checkForMate: true,
      });
      // console.log("BlackPawn: " + blackPawnSquares);
      if (blackPawnSquares > 0) {
        return true;
      }
    }
  });

  return availableSquare;
};

export const checkChecker = ({
  chessMatrix,
  opponentColor,
  tableLocation,
  tableLocationFrom,
  figure,
}) => {
  const playerColor = opponentColor === "white" ? "black" : "white";

  const newMatrix = JSON.parse(JSON.stringify(chessMatrix));
  const curX = tableLocationFrom[0];
  const curY = tableLocationFrom[1];

  const posX = tableLocation[0];
  const posY = tableLocation[1];

  newMatrix[curX][curY].figure = "empty";
  newMatrix[posX][posY].figure = figure;

  const kingSquare = newMatrix
    .flat()
    .find((square) => square.figure === "king " + playerColor);

  const kingX = kingSquare.tableLocation[0];
  const kingY = kingSquare.tableLocation[1];

  const check = attackedSquare(kingX, kingY, newMatrix, opponentColor, "none");

  return check;
};

// Attacked square
export const attackedSquare = (
  x,
  y,
  chessMatrix,
  opponentColor,
  figureToCheck
) => {
  const playerColor = opponentColor === "white" ? "black" : "white";

  //
  // FORWARD(Queen, Rook) attacked ?
  //
  for (let i = y + 1; i < chessMatrix.length; i++) {
    const figure = chessMatrix[x][i].figure;
    if (figure !== "empty") {
      if (figure.includes(opponentColor)) {
        if (figure.includes("queen") || figure.includes("rook")) {
          return true;
        } else {
          break;
        }
      } else {
        if (figure === figureToCheck) {
          continue;
        } else {
          break;
        }
      }
    }
  }
  // //
  // // BACK(Queen, Rook) attacked ?
  // //
  for (let i = y - 1; i >= 0; i--) {
    const figure = chessMatrix[x][i].figure;
    if (figure !== "empty") {
      if (figure.includes(opponentColor)) {
        if (figure.includes("queen") || figure.includes("rook")) {
          return true;
        } else {
          break;
        }
      } else {
        if (figure === figureToCheck) {
          continue;
        } else {
          break;
        }
      }
    }
  }
  // //
  // // RIGHT(Queen, Rook) attacked ?
  // //
  for (let i = x + 1; i < chessMatrix.length; i++) {
    const figure = chessMatrix[i][y].figure;
    if (figure !== "empty") {
      if (figure.includes(opponentColor)) {
        if (figure.includes("queen") || figure.includes("rook")) {
          return true;
        } else {
          break;
        }
      } else {
        if (figure === figureToCheck) {
          continue;
        } else {
          break;
        }
      }
    }
  }
  // //
  // // LEFT(Queen, Rook) attacked ?
  // //
  for (let i = x - 1; i >= 0; i--) {
    const figure = chessMatrix[i][y].figure;
    if (figure !== "empty") {
      if (figure.includes(opponentColor)) {
        if (figure.includes("queen") || figure.includes("rook")) {
          return true;
        } else {
          break;
        }
      } else {
        if (figure === figureToCheck) {
          continue;
        } else {
          break;
        }
      }
    }
  }

  //
  // FORWARD RIGHT(Queen, Bishop) attacked ?
  //
  const endTableFR = Math.max(x, y);
  for (let i = 1; i < chessMatrix.length - endTableFR; i++) {
    const figure = chessMatrix[x + i][y + i].figure;
    if (figure !== "empty") {
      if (figure.includes(opponentColor)) {
        if (figure.includes("queen") || figure.includes("bishop")) {
          return true;
        } else {
          break;
        }
      } else {
        if (figure === figureToCheck) {
          continue;
        } else {
          break;
        }
      }
    }
  }

  //
  // FORWARD LEFT(Queen, Bishop) attacked ?
  //
  let endTableFL;
  if (x >= 7 - y) {
    endTableFL = 7 - y;
  } else {
    endTableFL = x;
  }
  for (let i = 1; i < endTableFL + 1; i++) {
    const figure = chessMatrix[x - i][y + i].figure;
    if (figure !== "empty") {
      if (figure.includes(opponentColor)) {
        if (figure.includes("queen") || figure.includes("bishop")) {
          return true;
        } else {
          break;
        }
      } else {
        if (figure === figureToCheck) {
          continue;
        } else {
          break;
        }
      }
    }
  }

  //
  // BACK RIGHT(Queen, Bishop) attacked ?
  //
  let endTableBR;
  if (y >= 7 - x) {
    endTableBR = 7 - x;
  } else {
    endTableBR = y;
  }

  for (let i = 1; i < endTableBR + 1; i++) {
    const figure = chessMatrix[x + i][y - i].figure;

    if (figure !== "empty") {
      if (figure.includes(opponentColor)) {
        if (figure.includes("queen") || figure.includes("bishop")) {
          return true;
        } else {
          break;
        }
      } else {
        if (figure === figureToCheck) {
          continue;
        } else {
          break;
        }
      }
    }
  }
  //
  // BACK LEFT(Queen, Bishop) attacked ?
  //
  const endTableBL = Math.min(x, y);

  for (let i = 1; i < endTableBL + 1; i++) {
    const figure = chessMatrix[x - i][y - i].figure;

    if (figure !== "empty") {
      if (figure.includes(opponentColor)) {
        if (figure.includes("queen") || figure.includes("bishop")) {
          return true;
        } else {
          break;
        }
      } else {
        if (figure === figureToCheck) {
          continue;
        } else {
          break;
        }
      }
    }
  }

  //
  // KNIGHT attacked ?
  //
  // Forward
  if (y + 2 < 8) {
    // right
    if (x + 1 < 8) {
      if (chessMatrix[x + 1][y + 2].figure.includes(opponentColor))
        if (chessMatrix[x + 1][y + 2].figure.includes("knight")) {
          return true;
        }
    }
    // left
    if (x - 1 >= 0) {
      if (chessMatrix[x - 1][y + 2].figure.includes(opponentColor))
        if (chessMatrix[x - 1][y + 2].figure.includes("knight")) {
          return true;
        }
    }
  }

  // // Right
  if (x + 2 < 8) {
    // forward
    if (y + 1 < 8) {
      if (chessMatrix[x + 2][y + 1].figure.includes(opponentColor))
        if (chessMatrix[x + 2][y + 1].figure.includes("knight")) {
          return true;
        }
    }
    // back
    if (y - 1 >= 0) {
      if (chessMatrix[x + 2][y - 1].figure.includes(opponentColor))
        if (chessMatrix[x + 2][y - 1].figure.includes("knight")) {
          return true;
        }
    }
  }

  // // Back
  if (y - 2 >= 0) {
    // right
    if (x + 1 < 8) {
      if (chessMatrix[x + 1][y - 2].figure.includes(opponentColor))
        if (chessMatrix[x + 1][y - 2].figure.includes("knight")) {
          return true;
        }
    }
    // left
    if (x - 1 >= 0) {
      if (chessMatrix[x - 1][y - 2].figure.includes(opponentColor))
        if (chessMatrix[x - 1][y - 2].figure.includes("knight")) {
          return true;
        }
    }
  }

  // // Left
  if (x - 2 >= 0) {
    // forward
    if (y + 1 < 8) {
      if (chessMatrix[x - 2][y + 1].figure.includes(opponentColor))
        if (chessMatrix[x - 2][y + 1].figure.includes("knight")) {
          return true;
        }
    }
    // back
    if (y - 1 >= 0) {
      if (chessMatrix[x - 2][y - 1].figure.includes(opponentColor))
        if (chessMatrix[x - 2][y - 1].figure.includes("knight")) {
          return true;
        }
    }
  }

  //
  // PAWN black attacked ?
  //
  if (playerColor === "white") {
    if (y + 1 < 8) {
      if (x + 1 < 8) {
        if (chessMatrix[x + 1][y + 1].figure.includes(opponentColor)) {
          if (chessMatrix[x + 1][y + 1].figure.includes("pawn")) {
            return true;
          }
        }
      }
      if (x - 1 >= 0) {
        if (chessMatrix[x - 1][y + 1].figure.includes(opponentColor)) {
          if (chessMatrix[x - 1][y + 1].figure.includes("pawn")) {
            return true;
          }
        }
      }
    }
  }
  //
  // PAWN white attacked ?
  //
  if (playerColor === "black") {
    if (y - 1 >= 0) {
      if (x + 1 < 8) {
        if (chessMatrix[x + 1][y - 1].figure.includes(opponentColor)) {
          if (chessMatrix[x + 1][y - 1].figure.includes("pawn")) {
            return true;
          }
        }
      }
      if (x - 1 >= 0) {
        if (chessMatrix[x - 1][y - 1].figure.includes(opponentColor)) {
          if (chessMatrix[x - 1][y - 1].figure.includes("pawn")) {
            return true;
          }
        }
      }
    }
  }

  //
  // KING attacked ?
  //

  // Forward
  if (y + 1 < 8) {
    if (chessMatrix[x][y + 1].figure.includes("king " + opponentColor)) {
      return true;
    }
    // right
    if (x + 1 < 8) {
      if (chessMatrix[x + 1][y + 1].figure.includes("king " + opponentColor)) {
        return true;
      }
    }
    // left
    if (x - 1 >= 0) {
      if (chessMatrix[x - 1][y + 1].figure.includes("king " + opponentColor)) {
        return true;
      }
    }
  }
  // Back
  if (y - 1 >= 0) {
    if (chessMatrix[x][y - 1].figure.includes("king " + opponentColor)) {
      return true;
    }
    // right
    if (x + 1 < 8) {
      if (chessMatrix[x + 1][y - 1].figure.includes("king " + opponentColor)) {
        return true;
      }
    }
    // left
    if (x - 1 >= 0) {
      if (chessMatrix[x - 1][y - 1].figure.includes("king " + opponentColor)) {
        return true;
      }
    }
  }
  // Right
  if (x + 1 < 8) {
    if (chessMatrix[x + 1][y].figure.includes("king " + opponentColor)) {
      return true;
    }
  }
  // Left
  if (x - 1 >= 0) {
    if (chessMatrix[x - 1][y].figure.includes("king " + opponentColor)) {
      return true;
    }
  }

  return false;
};
